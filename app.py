from flask import Flask, send_from_directory

app = Flask(__name__)

@app.route('/')
def inicio():
    return send_from_directory('.', 'index.html')

@app.route('/css/<path:archivo>')
def css(archivo):
    return send_from_directory('css', archivo)

@app.route('/js/<path:archivo>')
def js(archivo):
    return send_from_directory('js', archivo)

@app.route('/html/<path:archivo>')
def html(archivo):
    return send_from_directory('html', archivo)

if __name__ == '__main__':
    app.run(debug=True)