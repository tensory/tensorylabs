#!/usr/bin/env python
from flask import Flask, render_template
app = Flask(__name__)


@app.route('/')
def index():
	return display('about')
	
@app.route('/projects/')
def projects():
	return display('projects')

def display(pagename):
	return render_template('%s.html' % pagename, current=pagename)
		
		
if __name__ == '__main__':
	app.debug = True
	app.run()
	
