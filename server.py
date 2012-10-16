#!/usr/bin/env python
from flask import Flask, render_template, request
from flask.ext.sendmail import Mail

from contact_form import ContactForm

app = Flask(__name__)


@app.route('/')
def index():
	return display('about')
	
@app.route('/projects/')
def projects():
	return display('projects')
	
@app.route('/contact/', methods=['GET', 'POST'])
def contact():
	form = ContactForm(request.form)
	if request.method == 'POST':
		# Send email
		pass		
	return render_template('contact.html', form=form)
	
def display(pagename):
	return render_template('%s.html' % pagename, current=pagename)
		
if __name__ == '__main__':
	app.debug = True
	app.run()
	
