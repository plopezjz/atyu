import nltk
from nltk.corpus import stopwords
from nltk import word_tokenize


class Ngrama:
    def __init__(self, ngram_type='words', ngram_lang='es', ngrama_length=2, delete_stopwords=False):
        self._type = ngram_type
        self._lang = 'english' if ngram_lang == 'en' else 'spanish'
        self._length = ngrama_length
        self._delete_stopwords = delete_stopwords
        self._text = ''

    def get_text(self):
        return self._text

    # Genera el ngrama de un texto, tamaño y tipo proporcionado en la configuración
    # TODO: En teoria habria que tener un método por cada tipo de n-grama
    #       en el contexto actual seria generar un método diferente para el de tipo 'caracteres'
    # TODO: Hay que agregar un parámetro con la frecuencia de aparicion de cada palabra
    # TODO: Existe etiquetado pos para caracteres?
    # TODO: Agregar condicion para eliminar stop words

    def generate(self, sample):
        # Eliminar los stop words en base al parámetro del usuario con el lang
        if self._delete_stopwords:
            tokens = word_tokenize(sample)
            sample = [word for word in tokens if word not in stopwords.words(self._lang)]

        if self._type == 'char':
            self._text = self.character_ngrams(' '.join(sample))
        elif self._type == 'pos':
            self._text = self.pos_tagger(sample)
        elif self._type == 'words':
            temp = zip(*[sample[i:] for i in range(0, self._length)])
            self._text = [' '.join(size) for size in temp]

    def pos_tagger(self, tokens_text):
        tags = nltk.pos_tag(tokens_text)
        result = ""
        for t in tags:
            result += t[0] + ' '
        return result

    def character_ngrams(self, text):
        return [text[i:i + self._length] for i in range(len(text) - self._length + 1)]
