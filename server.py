#!/usr/bin/env python
from flask import Flask, render_template

from contact_form import ContactForm

app = Flask(__name__)

@app.route('/')
def index():
	return display('about')
	
@app.route('/projects/')
def projects():
	return display('projects')
	
@app.route('/contact/')
def contact():
	recipient = "alacenski@gmail.com"
				
	return render_template('contact.html', form=form)
	
def display(pagename):
	return render_template('%s.html' % pagename, current=pagename)
		
if __name__ == '__main__':
	app.run(host='0.0.0.0')
	
