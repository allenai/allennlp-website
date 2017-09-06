---
layout: tutorial
title: Vocabularies in AllenNLP
id: vocabulary
---

[Jupyter notebook version](https://github.com/allenai/allennlp/blob/master/tutorials/notebooks/vocabulary.ipynb)

### Vocabularies in AllenNLP

Before we start, this tutorial assumes you've already gone through
[the tutorial on `Datasets`, `Instances` and `Fields`](datasets-instances-fields).
If you haven't, you might want to check out that one first as we make use of some of these constructs to explain the `Vocabulary` functionality.

A `Vocabulary` maps strings to integers, allowing for strings to be mapped to an
 out-of-vocabulary token.

Vocabularies can be fit to a particular dataset, which we use to decide which tokens are
 in-vocabulary, or alternatively, they can be loaded directly from a static vocabulary file.


First, let's import the vocabulary class from `allennlp` and create a vocabulary.



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
from allennlp.data import Vocabulary
```


Let's create an empty `Vocabulary` so we can look at the arguments it takes.



```python
vocab = Vocabulary(counter=None, min_count=1, max_vocab_size=100000)
```


The vocabulary takes 4 arguments (we've used 3 of these here):

- A counter, which is a `Dict[str, Dict[str, int]]`: This is a nested dictionary because the allennlp Vocabulary class supports the idea of "namespaces". A namespace is a vocabulary which is associated with a part of your data. For instance, in a sequence tagging model, you would typically have two namespaces: A namespace of words for your textual input and a namespace of tags(e.g. "NP", "VP", etc) for your labels. This counter is therefore a mapping from string namespace names to their respective mapping dictionaries of `Dict[tokens => counts]`.


- A minimum count: Tokens with smaller counts than this won't be included in your `Vocabulary`.


- A maximum vocab size: The lowest frequency words will be dropped to make your vocabulary this size.


- Non padded namespaces (left as the defaults for this tutorial): These are `namespace` suffixes which won't contain padding and unknown tokens. By default, these are `*labels` and `*tags`, so any namespace you create which ends with one of these names (e.g `sequence_labels`) won't contain these additional tokens. The reason for this is explained a bit more below.


For some namespaces, such as words, we provide additional tokens commonly used in NLP applications - specifically, "@@PADDING@@" and "@@UNKNOWN@@". Why did we use these slightly odd tokens? Well, if anything goes wrong in your model, it's going to be pretty obvious, because these tokens are pretty hard to miss. However, for other namespaces, such as tags, you _don't_ want these extra tokens, because in your model, you are going to be creating a distribution over the size of this namespace, so if we have added extra tags, your model could predict these.


It's easy to interact with the vocabulary we just created. Let's add some words!



```python
vocab.add_token_to_namespace("Barack", namespace="tokens")
vocab.add_token_to_namespace("Obama", namespace="tokens")

vocab.add_token_to_namespace("PERSON", namespace="tags")
vocab.add_token_to_namespace("PLACE", namespace="tags")
print(vocab.get_index_to_token_vocabulary("tokens"))
print(vocab.get_index_to_token_vocabulary("tags"))
```

    {0: '@@PADDING@@', 1: '@@UNKNOWN@@', 2: 'Barack', 3: 'Obama'}
    {0: 'PERSON', 1: 'PLACE'}


Notice that when we print the namespace for `tags` we don't have any padding tokens or unknown tokens. Additionally, you can add tokens to a `namespace` by loading them directly from a file using the `set_from_file` method. It needs to contain the OOV token as well and will overwrite tokens in the namespace specified.


It's also easy to interact with the Vocabulary to retrieve specific word ids or tokens for a given id.



```python
print("Index 2 has token: ", vocab.get_token_from_index(2, namespace="tokens"))
print("Word 'Barack' has index: ", vocab.get_token_index("Barack", namespace="tokens"))
```

    Index 2 has token:  Barack
    Word 'Barack' has index:  2


Also note that `namespaces` will deal with OOV tokens differently depending on whether they contain an OOV Token. See the difference between asking for an index for "pernacious" in the two different `namespaces` we've created in our toy `Vocabulary`:


```python
print("The index of 'pernacious' in the 'tokens' namespace should be 1 (The @@UNKOWN@@ token): ", vocab.get_token_index("pernacious", namespace="tokens"))

try:
    vocab.get_token_index("pernacious", namespace="tags")
except KeyError:
    print("As 'tags' doesn't have an unknown token, fetching non-existent tags will throw a KeyError.")
```

    The index of 'pernacious' in the 'tokens' namespace should be 1 (The @@UNKOWN@@ token):  1
    As 'tags' doesn't have an unknown token, fetching non-existent tags will throw a KeyError.



Above, we demonstrated the basic functionality of the namespaces in the Vocabulary. So far so good - probably not much different to other `Vocabulary` type classes for NLP that you've seen before. However, we'd ideally like to
generate a full `Vocabulary` without having to individually add all the different words. Below, we'll generate a `Dataset` consisting of a single `Instance` and use it to automatically generate a `Vocabulary`.



```python
from allennlp.data.fields import TextField, SequenceLabelField
from allennlp.data import Dataset, Instance
from allennlp.data.token_indexers import SingleIdTokenIndexer
sentence = TextField(tokens=["Barack", "Obama", "is", "a", "great", "guy", "."],
                     token_indexers={"tokens": SingleIdTokenIndexer()})
tags = SequenceLabelField(["PERSON", "PERSON", "O", "O", "O", "O", "O"], sentence, label_namespace="tags")
toy_dataset = Dataset([Instance({"sentence": sentence, "tags": tags})])
```


Now we've generated this baby dataset with one training instance, we can generate a `Vocabulary` using a classmethod on `Vocabulary`.


```python
vocab = Vocabulary.from_dataset(toy_dataset)
print(vocab.get_index_to_token_vocabulary("tokens"))
print(vocab.get_index_to_token_vocabulary("tags"))
```

    100%|██████████| 1/1 [00:00<00:00, 6797.90it/s]

    {0: '@@PADDING@@', 1: '@@UNKNOWN@@', 2: 'Barack', 3: 'is', 4: 'guy', 5: 'Obama', 6: 'a', 7: '.', 8: 'great'}
    {0: 'O', 1: 'PERSON'}





Note that the vocab we created has `tokens` and `tags` namespaces. These come from the key in the `token_indexers` dict in the `TextField` and the `tag_namespace` parameter in the `TagField`. At first, it seems confusing as to why it's possible to have multiple `TokenIndexers`. This is because in `allennlp`, we make a distinction between _tokenisation_ and _token representation_. More on this in the NLP API Tutorial!
