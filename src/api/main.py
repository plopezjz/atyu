from flask import Flask, request
from flask import jsonify
from flask_cors import cross_origin
from collections import Counter
import zipfile, io
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn import metrics
from nltk import word_tokenize
import matplotlib.pyplot as plt
import seaborn as sn
import pandas as pd
import nltk
import re

from ngrama import Ngrama
from config import config
from models import db
from models import User

nltk.download('stopwords')
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')


def create_app(enviroment):
    app = Flask(__name__)

    app.config.from_object(enviroment)

    with app.app_context():
        db.init_app(app)
        db.create_all()

    return app


environment = config['development']
app = create_app(environment)


# Obtiene todos los usuarios


@app.route('/api/v1/users', methods=['GET'])
def get_users():
    users = [user.json() for user in User.query.all()]
    return jsonify({'users': users})


# Obtiene los usuarios por id
@app.route('/api/v1/users/<id>', methods=['GET'])
def get_user(id):
    user = User.query.filter_by(id=id).first()
    if user is None:
        return jsonify({'message': 'El usuario no existe'}), 404

    return jsonify({'user': user.json()})


# Crear un nuevo usuario con los datos de session
@app.route('/api/v1/users/', methods=['POST'])
def create_user():
    json = request.get_json(force=True)

    if json.get('username') is None:
        return jsonify({'message': 'Bad request'}), 400

    user = User.create(json['username'])

    return jsonify({'user': user.json()})


# Actualiza campos específicos del usuario
@app.route('/api/v1/users/<id>', methods=['PUT'])
def update_user(id):
    user = User.query.filter_by(id=id).first()
    if user is None:
        return jsonify({'message': 'El usuario no existe'}), 404

    json = request.get_json(force=True)
    if json.get('username') is None:
        return jsonify({'message': 'Bad request'}), 400

    user.username = json['username']

    user.update()

    return jsonify({'user': user.json()})


# Maneja la eliminación de una cuenta de usuario
@app.route('/api/v1/users/<id>', methods=['DELETE'])
def delete_user(id):
    user = User.query.filter_by(id=id).first()
    if user is None:
        return jsonify({'message': 'El usuario no existe'}), 404

    # TODO: Tomar en cuenta que debe ser un borrado lógico
    user.delete()

    return jsonify({'user': user.json()})


# Genera un evento de procesamiento para generar los ngramas
# Retorna los datos del diagrama de frecuencias

# TODO Tokenizar por sentencias para crear las muestras - y pedir el parámetro
# TODO Agregar una columna al csv final para que indique cual es el autor al cual le corresponde la muestra
# Se le debe pedir la distribucion para entrenar regularmente 80 (entrenar) y 20 (evaluar)

# Validar fit y fit_transform
@app.route('/api/v1/process_ngrams/', methods=['POST'])
@cross_origin()
def process_ngrams():

    if request.values.get('ngram_length') is None or request.values.get('ngram_type') is None:
        return jsonify(
            {'message': 'Bad request - Favor de proporcionar la configuración y el documento a procesar'}), 400

    # Usuario para llevar un control de los documentos que ha procesado
    # TODO: Por el momento se crea un usuario nuevo por cada evento, esto debe
    #       cambiar para poder  buscar si el usuario ya existe y asignarle el evento 
    user = User.create(request.values.get('user_name'))

    # ngrams = Event.create(json['configuration'])

    # Procesamiento de los documentos:
    # Obtenemos la configuracíon del evento


    # TODO revisar que se debe pedir al usuario la frecuencia de repeticion de cada palabra
    ngram_length = int(request.values.get('ngram_length'))
    ngram_type = request.values.get('ngram_type')
    ngram_lang = request.values.get('ngram_lang')
    ngram_frecuency = request.values.get('ngram_frequency')
    delete_stopwords = bool(request.values.get('delete_stopwords'))

    for file in request.files:
        if request.files[file].content_type == 'application/zip':
            if len(request.files) > 1:
                return jsonify(
                    {'message': 'Bad request - Solo se puede adjuntar un archivo zip'}), 400

            zip_file = zipfile.ZipFile(io.BytesIO(request.files[file].read()))

            for path in zip_file.namelist():
                if not valid(path):
                    return jsonify(
                        {'message': 'Bad request - No se cumple con el formato zip correcto'}), 400

    # se debe guardar un diccionario de los ngramas correspondientes a cada muestra.
    # Ejemplo: {id: 0001, ngramas: ['lana sube lana', 'sube lana baja']}
    result = {}
    text_tokens = {}
    counter_text_tokens = []
    truncate_text = {}
    temp_texts = {}

    aeiou, baeiou = 'áéíóúüñ', 'aeiouun'
    trans = str.maketrans(aeiou, baeiou)

    # Limpieza del texto

    for file in request.files:
        # Eliminamos los caracteres especiales
        clear_text = (request.files[file].read().decode('utf-8')
                      .replace("\n", "")
                      .replace("\t", "")
                      .replace(".", "")
                      .lower().translate(trans))

        text = re.sub(r'[^a-zA-Z0-9\s]+', '', clear_text)
        temp_texts[file] = text # TODO: Borrar después no se usa solo para pruebas
        # Tokenizar y revisar la frecuencia
        tokens_in_text = word_tokenize(text)
        counter_text_tokens.append(len(tokens_in_text))
        # Tomar el listado de tokens y luego truncar
        # Unir los tokens para obtener el texto nuevamente

        text_tokens[file] = tokens_in_text

    # Obtenemos el texto mas pequeño
    smaller_text = min(counter_text_tokens)

    # Truncar el archivo al archivo mas pequeño.
    for novel in text_tokens:
        truncate_text[novel] = ' '.join(text_tokens[novel][:smaller_text])

    # Creamos la clase N grama con las configuraciones que recibimos del excel
    n_grama = Ngrama(ngram_type, ngram_lang, ngram_length, delete_stopwords)
    for novel in truncate_text:
        # Pasarle el texto ya truncado
        n_grama.generate(truncate_text[novel])
        temp = n_grama.get_text()
        temp = [item.replace(' ', '_') for item in temp]
        result[novel] = temp

    json_result = {}
    headers = {}
    data_frames = []
    result_data = []
    n = 0
    # Guardar en un diccionario los nombres de los archivos
    names = {}

    for sample in result:
        counter = Counter(sample)
        df = pd.DataFrame([(key, counter[key]) for key in counter])
        df.columns = ['ngram', sample]
        data_frames.append(df)

    # Tomar como inicial el primer DataFrame
    df_complete = data_frames[0]
    for df in data_frames[1:]:
        df_complete = pd.merge(df_complete, df, how="outer", on=["ngram"])

    df_complete['suma_ngrama'] = df_complete.iloc[:, 1:].sum(axis=1)
    df_complete = df_complete.sort_values(by=['suma_ngrama'], ascending=False)
    # Convertir correctamente el DF en CSV sin encabezados.

    # Probar los algoritmos de entrenamiento

    #suma = df.sum(axis=0, )
    #df = df.append(suma, ignore_index=True)
    #df = df.reindex(sorted(df.columns, key=lambda x: df[x][len(clase)], reverse=True), axis=1)
    #clase.append(0)
    #df['clase'] = clase
    #df = df[:-1]
    #df.to_csv('vsm' + str(n) + 'gramas' + tipo + autor + tamano + '.csv', index=False)

    # El csv debe quedar ordenado de mayor a menor por frecuencia de n-grama tomando en cuenta la suma
    # de toda la columna (n-grama)
    # df = pd.read_csv('result.csv')
    # Agregamos la fila al final con los valores del autor que le corresponde
    df_complete.loc[len(df_complete.index)] = ['author', 1, 1, 1, 4, 3, 3, 2, 2, 2, 2, 0] # Agregar las columnas para los archivos o muestras dadas
    df_complete = df_complete.fillna(0)
    df_aux = df_complete.set_index('ngram').T[: -1] # Se elimina la ultima fila antes de entrenar
    y = df_aux.iloc[:, len(df_aux.columns) - 1]
    X = df_aux.drop('author', axis=1)
    # Se dividen los datos en prueba y entrenamiento
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=True)

    # Se crean los clasificadores (revisar por lo menos 4 métodos)
    svm = SVC(kernel='linear')
    lg = LogisticRegression(max_iter=1000)

    # Se ajustan los modelos a los datos
    svm.fit(X_train, y_train)
    lg.fit(X_train, y_train)

    # Se realizan las predicciones
    # Se pide al usuario que algoritmo utilizar
    conf1 = svm.predict(X_test)
    conf2 = lg.predict(X_test)

    matriz_de_confusion = metrics.confusion_matrix(y_test, conf1)
    plt.figure(figsize=(10, 7))
    sn.set(font_scale=1.4)
    cfm_plot = sn.heatmap(matriz_de_confusion, annot=True, annot_kws={"size": 16})
    cfm_plot.figure.savefig("connfusion_matrix.png")
    # Parsear respuesta del proceso de generacion de ngramas

    # Retornar las metricas, el csv y la matriz de confusión

    # Validar la documentacion
    # precision_score
    # recall_score
    # accuracy_score
    return "Hola usuario"


def valid(path):
    return len(re.findall('/', path)) == 2




if __name__ == '__main__':
    # TODO: Recordar eliminar la etiqueta debug cuando sea ambiente productivo
    app.run(debug=True)
