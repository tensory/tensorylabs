#!/usr/bin/env python
from flask import Flask
app = Flask(__name__)

@app.route('/')
def index():
	return 'there are times love will rattle your bones'

@app.route('/projects/')
def projects():
	return 'this is silly'
	
if __name__ == '__main__':
	app.debug = True
	app.run()
	
