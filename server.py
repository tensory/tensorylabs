#!/usr/bin/env python
from flask import Flask, render_template, request
from flask.ext.sendmail import Mail, Message

from contact_form import ContactForm

app = Flask(__name__)
mail = Mail(app)

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
		if form.validate():
			pass
		'''
			msg = Message("Subject", sender=(request.form.sender, request.form.email_address))
			msg.body = request.form.message
			# Send email
			mail.send(msg)
		'''
					
	return render_template('contact.html', form=form)
	
def display(pagename):
	return render_template('%s.html' % pagename, current=pagename)
		
if __name__ == '__main__':
	app.debug = True
	app.run()
	
