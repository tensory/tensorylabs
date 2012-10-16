from wtforms import Form, TextField, TextAreaField, SubmitField, validators

class ContactForm(Form):
	sender = TextField('Name', [validators.Required()],
		default="ari")
	email_address = TextField('Email address', [validators.Required(), validators.Email()], 					
		default="structureofskin@gmail.com")
	message = TextAreaField('Message', [validators.Required()],
		default="I'm a little teapot")
	submit = SubmitField('Send')
	# To do: add csrf protection