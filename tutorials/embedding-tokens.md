---
layout: tutorial
title: Embedding Tokens
id: embedding-tokens
---
This notebook introduces how AllenNLP handles one of the key aspects of applying deep learning techniques to textual data: learning distributed representations of words and sentences.

Recently, there has been an explosion of different techniques to represent words and sentences in NLP, including pre-trained word vectors, character level CNN encodings and sub-word token representation (e.g byte encodings). Even more complex learned representations of higher level lingustic features, such as POS tags, named entities and dependency paths have also proven successful for a wide variety of NLP tasks.

In order to deal with this breadth of methods for representing words as vectors, AllenNLP introduces 3 key abstractions:

- `TokenIndexers`, which generate indexed tensors representing sentences in different ways. See the [Data Pipeline notebook](data_pipeline.ipynb) for more info. 

- `TokenEmbedders`, which transform indexed tensors into embedded representations. At its most basic, this is just a standard `Embedding` layer you'd find in any neural network library. However, they can be more complex - for instance, AllenNLP has a `token_characters_encoder` which applies a CNN to character level representations.
- `TextFieldEmbedders`, which are a wrapper around a set of `TokenEmbedders`. At it's most basic, this applies the `TokenEmbedders` which it is passed and concatenates their output.

Using this hierarchy allows you to easily compose different representations of a sentence together in modular ways. For instance, in the Bidaf model, we use this to concatenate a character level CNN encoding of the words in the sentence to the pretrained word embeddings. You can also specify this completely from a JSON file, making experimenation with different representations extremely easy.
 


```python
# This cell just makes sure the library paths are correct. 
# You need to run this cell before you run the rest of this
# tutorial, but you can ignore the contents!
import os
import sys
module_path = os.path.abspath(os.path.join('../..'))
if module_path not in sys.path:
    sys.path.append(module_path)
```


```python
from allennlp.data.fields import TextField
from allennlp.data import Instance
from allennlp.data.token_indexers import SingleIdTokenIndexer, TokenCharactersIndexer
from allennlp.data.tokenizers import Token

words = ["All", "the", "cool", "kids", "use", "character", "embeddings", "."]
sentence1 = TextField([Token(x) for x in words],
                      token_indexers={"tokens": SingleIdTokenIndexer(namespace="tokens"),
                                      "characters": TokenCharactersIndexer(namespace="token_characters")})
words2 = ["I", "prefer", "word2vec", "though", "..."]
sentence2 = TextField([Token(x) for x in words2],
                      token_indexers={"tokens": SingleIdTokenIndexer(namespace="tokens"),
                                      "characters": TokenCharactersIndexer(namespace="token_characters")})
instance1 = Instance({"sentence": sentence1})
instance2 = Instance({"sentence": sentence2})

```

Now we need to create a small vocabulary from our sentence - note that because we have used both a
`SingleIdTokenIndexer` and a `TokenCharactersIndexer`, when we call `Vocabulary.from_dataset`, the created `Vocabulary` will have two namespaces, which correspond to the namespaces of each token indexer in our `TextField`'s.


```python
from allennlp.data import Vocabulary, Dataset

# Make 
dataset = Dataset([instance1, instance2])
vocab = Vocabulary.from_dataset(dataset)

print("This is the token vocabulary we created: \n")
print(vocab.get_index_to_token_vocabulary("tokens"))

print("This is the character vocabulary we created: \n")
print(vocab.get_index_to_token_vocabulary("token_characters"))

dataset.index_instances(vocab)

```

    100%|██████████| 2/2 [00:00<00:00, 5419.00it/s]
    100%|██████████| 2/2 [00:00<00:00, 6786.90it/s]

    This is the token vocabulary we created: 
    
    {0: '@@PADDING@@', 1: '@@UNKNOWN@@', 2: 'All', 3: 'the', 4: 'cool', 5: 'kids', 6: 'use', 7: 'character', 8: 'embeddings', 9: '.', 10: 'I', 11: 'prefer', 12: 'word2vec', 13: 'though', 14: '...'}
    This is the character vocabulary we created: 
    
    {0: '@@PADDING@@', 1: '@@UNKNOWN@@', 2: 'e', 3: 'r', 4: 'h', 5: 'c', 6: 'o', 7: 'd', 8: '.', 9: 'l', 10: 't', 11: 's', 12: 'i', 13: 'u', 14: 'a', 15: 'g', 16: 'A', 17: 'k', 18: 'm', 19: 'b', 20: 'n', 21: 'I', 22: 'p', 23: 'f', 24: 'w', 25: '2', 26: 'v'}


    



```python
from allennlp.modules.token_embedders import Embedding, TokenCharactersEncoder
from allennlp.modules.seq2vec_encoders import CnnEncoder
from allennlp.modules.text_field_embedders import BasicTextFieldEmbedder

# We're going to embed both the words and the characters, so we create
# embeddings with respect to the vocabulary size of each of the relevant namespaces
# in the vocabulary.
word_embedding = Embedding(num_embeddings=vocab.get_vocab_size("tokens"), embedding_dim=10)
char_embedding = Embedding(num_embeddings=vocab.get_vocab_size("token_characters"), embedding_dim=5)
character_cnn = CnnEncoder(embedding_dim=5, num_filters=2, output_dim=8)

# This is going to embed an integer character tensor of shape: (batch_size, max_sentence_length, max_word_length) into
# a 4D tensor with an additional embedding dimension, representing the vector for each character.
# and then apply the character_cnn we defined above over the word dimension, resulting in a tensor
# of shape: (batch_size, max_sentence_length, num_filters * ngram_filter_sizes). 
token_character_encoder = TokenCharactersEncoder(embedding=char_embedding, encoder=character_cnn)

# Notice that these keys have the same keys as the TokenIndexers when we created our TextField.
# This is how the text_field_embedder knows which function to apply to which array. 
# There should be a 1-1 mapping between TokenIndexers and TokenEmbedders in your model.
text_field_embedder = BasicTextFieldEmbedder({"tokens": word_embedding, "characters": token_character_encoder})
```

Now we've actually created all the parts which we need to create concatenated word and character CNN embeddings, let's actually apply our `text_field_embedder` and see what happens. 


```python
# Convert the indexed dataset into Pytorch Variables. 
tensors = dataset.as_tensor_dict(dataset.get_padding_lengths())
print("Torch tensors for passing to a model: \n\n", tensors)
print("\n\n")
# tensors is a nested dictionary, first keyed by the
# name we gave our instances (in most cases you'd have more
# than one field in an instance) and then by the key of each
# token indexer we passed to TextField.

# This will contain two tensors: one from representing each
# word as an index and one representing each _character_
# in each word as an index. 
text_field_variables = tensors["sentence"]

# This will have shape: (batch_size, sentence_length, word_embedding_dim + character_cnn_output_dim)
embedded_text = text_field_embedder(text_field_variables)

dimensions = list(embedded_text.size())
print("Post embedding with our TextFieldEmbedder: ")
print("Batch Size: ", dimensions[0])
print("Sentence Length: ", dimensions[1])
print("Embedding Size: ", dimensions[2])

```

    Torch tensors for passing to a model: 
    
     {'sentence': {'tokens': Variable containing:
        2     3     4     5     6     7     8     9
       10    11    12    13    14     0     0     0
    [torch.LongTensor of size 2x8]
    , 'characters': Variable containing:
    (0 ,.,.) = 
      16   9   9   0   0   0   0   0   0   0
      10   4   2   0   0   0   0   0   0   0
       5   6   6   9   0   0   0   0   0   0
      17  12   7  11   0   0   0   0   0   0
      13  11   2   0   0   0   0   0   0   0
       5   4  14   3  14   5  10   2   3   0
       2  18  19   2   7   7  12  20  15  11
       8   0   0   0   0   0   0   0   0   0
    
    (1 ,.,.) = 
      21   0   0   0   0   0   0   0   0   0
      22   3   2  23   2   3   0   0   0   0
      24   6   3   7  25  26   2   5   0   0
      10   4   6  13  15   4   0   0   0   0
       8   8   8   0   0   0   0   0   0   0
       0   0   0   0   0   0   0   0   0   0
       0   0   0   0   0   0   0   0   0   0
       0   0   0   0   0   0   0   0   0   0
    [torch.LongTensor of size 2x8x10]
    }}
    
    
    
    Post embedding with our TextFieldEmbedder: 
    Batch Size:  2
    Sentence Length:  8
    Embedding Size:  18


Here, we've manually created the different TokenEmbedders which we wanted to use in our `TextFieldEmbedder`. However, all of these modules can be built using their `from_params` method, so you can have a `TextFieldEmbedder` in your model which is fixed (it encodes some sentence which is an input to your model), but vary the `TokenIndexers` and `TokenEmbedders` which it uses by changing a JSON file.
