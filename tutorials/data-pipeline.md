---
layout: tutorial
title: Datasets, Instances, and Fields
id: datasets-instances-fields
---

Allennlp uses a hierarchical system of data structures to represent a Dataset which allow easy padding, batching and iteration. This tutorial will cover some of the basic concepts.


At a high level, we use `DatasetReaders` to read a particular dataset into a `Dataset` of self-contained individual `Instances`, 
which are made up of a dictionary of named `Fields`. There are many types of `Fields` which are useful for different types of data, such as `TextField`, for sentences, or `LabelField` for representing a categorical class label. Users who are familiar with the `torchtext` library from `Pytorch` will find a similar abstraction here. 




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

Let's create two of the most common `Fields`, imagining we are preparing some data for a sentiment analysis model. 


```python
from allennlp.data import Token
from allennlp.data.fields import TextField, LabelField
from allennlp.data.token_indexers import SingleIdTokenIndexer

review = TextField(list(map(Token, ["This", "movie", "was", "awful", "!"])), token_indexers={"tokens": SingleIdTokenIndexer()})
review_sentiment = LabelField("negative", label_namespace="tags")

# Access the original strings and labels using the methods on the Fields.
print("Tokens in TextField: ", review.tokens)
print("Label of LabelField", review_sentiment.label)
```

    Tokens in TextField:  [<allennlp.data.tokenizers.token.Token object at 0x7f8e2c3b4a58>, <allennlp.data.tokenizers.token.Token object at 0x7f8e2c3b4cf8>, <allennlp.data.tokenizers.token.Token object at 0x7f8dd6047208>, <allennlp.data.tokenizers.token.Token object at 0x7f8dd5fc4208>, <allennlp.data.tokenizers.token.Token object at 0x7f8dc74312b0>]
    Label of LabelField negative


Once we've made our `Fields`, we need to pair them together to form an `Instance`. 


```python
from allennlp.data import Instance

instance1 = Instance({"review": review, "label": review_sentiment})
print("Fields in instance: ", instance1.fields)
```

    Fields in instance:  {'review': <allennlp.data.fields.text_field.TextField object at 0x7f8e2c3b4b00>, 'label': <allennlp.data.fields.label_field.LabelField object at 0x7f8e2c3b4ac8>}


... and once we've made our `Instance`, we can group several of these into a `Dataset`.


```python
from allennlp.data import Dataset
# Create another 
review2 = TextField(list(map(Token, ["This", "movie", "was", "quite", "slow", "but", "good" "."])), token_indexers={"tokens": SingleIdTokenIndexer()})
review_sentiment2 = LabelField("positive", label_namespace="tags")
instance2 = Instance({"review": review2, "label": review_sentiment2})

review_dataset = Dataset([instance1, instance2])
```

In order to get our tiny sentiment analysis dataset ready for use in a model, we need to be able to do a few things: 
- Create a vocabulary from the Dataset (using `Vocabulary.from_dataset`)
- Index the words and labels in the`Fields` to use the integer indices specified by the `Vocabulary`
- Pad the instances to the same length
- Convert them into tensors.
The `Dataset`, `Instance` and `Fields` have some similar parts of their API. 


```python
from allennlp.data import Vocabulary 

# This will automatically create a vocab from our dataset.
# It will have "namespaces" which correspond to two things:
# 1. Namespaces passed to fields (e.g. the "tags" namespace we passed to our LabelField)
# 2. The keys of the 'Token Indexer' dictionary in 'TextFields'.
# passed to Fields (so it will have a 'tags' namespace).
vocab = Vocabulary.from_dataset(review_dataset)

print("This is the id -> word mapping for the 'tokens' namespace: ")
print(vocab.get_index_to_token_vocabulary("tokens"), "\n")
print("This is the id -> word mapping for the 'tags' namespace: ")
print(vocab.get_index_to_token_vocabulary("tags"), "\n")
print("Vocab Token to Index dictionary: ", vocab._token_to_index, "\n")
# Note that the "tags" namespace doesn't contain padding or unknown tokens.

# Next, we index our dataset using our newly generated vocabulary.
# This modifies the current object. You must perform this step before 
# trying to generate arrays. 
review_dataset.index_instances(vocab)

# Finally, we return the dataset as arrays, padded using padding lengths
# extracted from the dataset itself, which will be the max sentence length
# from our two instances.
padding_lengths = review_dataset.get_padding_lengths()
print("Lengths used for padding: ", padding_lengths, "\n")
tensor_dict = review_dataset.as_tensor_dict(padding_lengths)
print(tensor_dict)
```

    100%|██████████| 2/2 [00:00<00:00, 7294.44it/s]
    100%|██████████| 2/2 [00:00<00:00, 17260.51it/s]

    This is the id -> word mapping for the 'tokens' namespace: 
    {0: '@@PADDING@@', 1: '@@UNKNOWN@@', 2: 'This', 3: 'movie', 4: 'was', 5: 'awful', 6: '!', 7: 'quite', 8: 'slow', 9: 'but', 10: 'good.'} 
    
    This is the id -> word mapping for the 'tags' namespace: 
    {0: 'negative', 1: 'positive'} 
    
    Vocab Token to Index dictionary:  defaultdict(None, {'tokens': {'@@PADDING@@': 0, '@@UNKNOWN@@': 1, 'This': 2, 'movie': 3, 'was': 4, 'awful': 5, '!': 6, 'quite': 7, 'slow': 8, 'but': 9, 'good.': 10}, 'tags': {'negative': 0, 'positive': 1}}) 
    
    Lengths used for padding:  {'review': {'num_tokens': 7}} 
    
    {'review': {'tokens': Variable containing:
        2     3     4     5     6     0     0
        2     3     4     7     8     9    10
    [torch.LongTensor of size 2x7]
    }, 'label': Variable containing:
     0
     1
    [torch.LongTensor of size 2x1]
    }


    


Here, we've seen how to transform a dataset of 2 instances into arrays for feeding into an allennlp `Model`. One nice thing about the `Dataset` API is that we don't require the concept of a `Batch` - it's just a small dataset! If you are iterating over a large number of `Instances`, such as during training, you may want to look into `allennlp.data.Iterators`, which specify several different ways of iterating over a `Dataset` in batches, such as fixed batch sizes, bucketing and stochastic sorting. 

There's been one thing we've left out of this tutorial so far - explaining the role of the `TokenIndexer` in `TextField`. We decided to introduce a new step into the typical `tokenisation -> indexing -> embedding` pipeline, because for more complicated encodings of words, such as those including character embeddings, this pipeline becomes difficult. Our pipeline contains the following steps: `tokenisation -> TokenIndexers -> TokenEmbedders -> TextFieldEmbedders`. 

The token indexer we used above is the most basic one - it assigns a single ID to each word in the `TextField`. This is classically what you might think of when indexing words. 
However, let's take a look at using a `TokenCharacterIndexer` as well - this takes the words in a `TextField` and generates indices for the characters in the words.




```python
from allennlp.data.token_indexers import TokenCharactersIndexer

word_and_character_text_field = TextField(list(map(Token, ["Here", "are", "some", "longer", "words", "."])), 
                                          token_indexers={"tokens": SingleIdTokenIndexer(), "chars": TokenCharactersIndexer()})
mini_dataset = Dataset([Instance({"sentence": word_and_character_text_field})])

# Fit a new vocabulary to this Field and index it:
word_and_char_vocab = Vocabulary.from_dataset(mini_dataset)
mini_dataset.index_instances(word_and_char_vocab)

print("This is the id -> word mapping for the 'tokens' namespace: ")
print(vocab.get_index_to_token_vocabulary("tokens"), "\n")
print("This is the id -> word mapping for the 'chars' namespace: ")
print(vocab.get_index_to_token_vocabulary("chars"), "\n")


# Now, the padding lengths method will find the max sentence length 
# _and_ max word length in the batch and pad all sentences to the max
# sentence length and all words to the max word length.
padding_lengths = mini_dataset.get_padding_lengths()
print("Lengths used for padding (Note that we now have a new "
      "padding key num_token_characters from the TokenCharactersIndexer): ")
print(padding_lengths, "\n")

tensor_dict = mini_dataset.as_tensor_dict(padding_lengths)

print(tensor_dict)
```

    100%|██████████| 1/1 [00:00<00:00, 5722.11it/s]
    100%|██████████| 1/1 [00:00<00:00, 2695.57it/s]

    This is the id -> word mapping for the 'tokens' namespace: 
    {0: '@@PADDING@@', 1: '@@UNKNOWN@@', 2: 'This', 3: 'movie', 4: 'was', 5: 'awful', 6: '!', 7: 'quite', 8: 'slow', 9: 'but', 10: 'good.'} 
    
    This is the id -> word mapping for the 'chars' namespace: 
    {0: '@@PADDING@@', 1: '@@UNKNOWN@@'} 
    
    Lengths used for padding (Note that we now have a new padding key num_token_characters from the TokenCharactersIndexer): 
    {'sentence': {'num_tokens': 6, 'num_token_characters': 6}} 
    
    {'sentence': {'tokens': Variable containing:
     2  3  4  5  6  7
    [torch.LongTensor of size 1x6]
    , 'chars': Variable containing:
    (0 ,.,.) = 
       6   2   3   2   0   0
       7   3   2   0   0   0
       5   4   8   2   0   0
       9   4  10  11   2   3
      12   4   3  13   5   0
      14   0   0   0   0   0
    [torch.LongTensor of size 1x6x6]
    }}


    


Now we've used a new token indexer, you can see that the `review` field of the returned dictionary now has 2 elements: `tokens`, a tensor representing the indexed tokens and `chars`, a tensor representing each word in the `TextField` as a list of character indices. Crucially, each list of integers for each word has been padded to the length of the maximum word in the sentence. 
