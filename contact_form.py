from wtforms import Form, TextField, TextAreaField, SubmitField, validators

class ContactForm(Form):
	sender = TextField('Name', [validators.Required])
	email_address = TextField('Email address', [validators.Required, validators.Email])
	message = TextAreaField('Message', [validators.Required])
	submit = SubmitField('Send')