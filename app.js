const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
	'mode': 'sandbox',
	'client_id': '[ClientId]',
	'client_secret': '[ClientSecret]'
});

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

app.post('/pay', (req, res) => {
	const create_payment_json = {
		"intent": "sale",
		"payer": {
			"payment_method": "paypal"
		},
		"redirect_urls": {
			"return_url": "http://localhost:8080/success",
			"cancel_url": "http://localhost:8080/cancel"
		},
		"transactions": [{
			"items_list": {
				"items": [{
					"name": "",
					"sku": "",
					"price": "",
					"currency": "",
					"quantity":1
				}]
			},
			"amount": {
				"currency": "",
				"total": ""
			},
			"description": ""
		}]
	};
	paypal.payment.create(create_payment_json, function(error, payment){
		if(error){
			throw error;
		}else{
			for(let i = 0; i < payment.links.length; i++){
				if(payment.links[i].rel === 'approval_url'){
					res.redirect(payment.links[i].href);
				}
			}
		}
	});
});

app.get('/success', (req, res) => {
	const payerId = req.query.payerId;
	const paymentId = req.query.paymentId;
	const execute_payment_json = {
		"payer_Id": payerId,
		"transactions": [{
			"amount": {
				"currency": "",
				"total": ""
			}
		}]
	};
	paypal.payment.execute(paymentId, execute_payment_json, function(error, payment){
		if(error){
			console.log(error.response);
			throw error;
		}else{
			console.log(JSON.stringify(payment));
			res.send('Success');
		}
	});
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(8080, () => console.log('Server Started'));
