const fetch = require('node-fetch');
const inputBody = {
  "amount": 0.01,
  "currency": "USD"
};

const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'x-api-key':'jai3UqdSWo60M8XxvHGf648oOmQlYdEtaYzknZHo',
  'Authorization': 'eyJraWQiOiJQcmRPSTlhZGU0ZlVuYUVYQVJ5R1Z0STZFQ01hbEZ5ZEtLdW9RelhnS3ljPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI2bWJ0cjNiYjJsZDdtM3RobzVjaWg4M2dnMiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiaHR0cHM6XC9cL2lhbS5hcGkucmVkZG90cGF5LnNnXC9hY2Nlc3MuZGVsZXRlIGh0dHBzOlwvXC9pYW0uYXBpLnJlZGRvdHBheS5zZ1wvcGxhbi5jcmVhdGUgaHR0cHM6XC9cL2FsdHBheS5hcGkucmVkZG90cGF5LnNnXC9vcmRlci5hdXRob3JpemUgaHR0cHM6XC9cL2NhcmRwYXkuYXBpLnJlZGRvdHBheS5zZ1wvb3JkZXIuY2hhcmdlYmFjayBodHRwczpcL1wvY2FyZC5hcGkucmVkZG90cGF5LnNnXC90b2tlbi5jcmVhdGUgaHR0cHM6XC9cL2NhcmRwYXkuYXBpLnJlZGRvdHBheS5zZ1wvb3JkZXIucmVhZCBodHRwczpcL1wvY2FyZHBheS5hcGkucmVkZG90cGF5LnNnXC9vcmRlci52b2lkIGh0dHBzOlwvXC9jYXJkcGF5LmFwaS5yZWRkb3RwYXkuc2dcL29yZGVyLmF1dGhvcml6ZSBodHRwczpcL1wvYWx0cGF5LmFwaS5yZWRkb3RwYXkuc2dcL29yZGVyLnJlZnVuZCBodHRwczpcL1wvY2FyZC5hcGkucmVkZG90cGF5LnNnXC9yZXBvLmNyZWF0ZSBodHRwczpcL1wvYWx0cGF5LmFwaS5yZWRkb3RwYXkuc2dcL29yZGVyLnZvaWQgaHR0cHM6XC9cLzNkc2VjdXJlLmFwaS5yZWRkb3RwYXkuc2dcL3Byb2Nlc3MuY3JlYXRlIGh0dHBzOlwvXC9jYXJkLmFwaS5yZWRkb3RwYXkuc2dcL3Rva2VuLnJlYWQgaHR0cHM6XC9cL2lhbS5hcGkucmVkZG90cGF5LnNnXC9wbGFuLmRlbGV0ZSBodHRwczpcL1wvaWFtLmFwaS5yZWRkb3RwYXkuc2dcL2FjY2Vzcy5jcmVhdGUgaHR0cHM6XC9cL2FsdHBheS5hcGkucmVkZG90cGF5LnNnXC9vcmRlci5jYXB0dXJlIGh0dHBzOlwvXC8zZHNlY3VyZS5hcGkucmVkZG90cGF5LnNnXC9lbnJvbGwuY3JlYXRlIGh0dHBzOlwvXC9hbHRwYXkuYXBpLnJlZGRvdHBheS5zZ1wvb3JkZXIuY2xvc2UgaHR0cHM6XC9cL2FsdHBheS5hcGkucmVkZG90cGF5LnNnXC9vcmRlci5mZXRjaCBodHRwczpcL1wvY2FyZHBheS5hcGkucmVkZG90cGF5LnNnXC9vcmRlci5jYXB0dXJlIGh0dHBzOlwvXC9jYXJkLmFwaS5yZWRkb3RwYXkuc2dcL3Rva2VuLmRlbGV0ZSBodHRwczpcL1wvaWFtLmFwaS5yZWRkb3RwYXkuc2dcL2hvc3RlZC5hY2Nlc3MuY3JlYXRlIGh0dHBzOlwvXC9jYXJkcGF5LmFwaS5yZWRkb3RwYXkuc2dcL29yZGVyLnJlZnVuZCBodHRwczpcL1wvY2FyZC5hcGkucmVkZG90cGF5LnNnXC90b2tlbnMucmVhZCIsImF1dGhfdGltZSI6MTU0ODIxMzIzOSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmFwLXNvdXRoZWFzdC0xLmFtYXpvbmF3cy5jb21cL2FwLXNvdXRoZWFzdC0xXzMxQkRNMWhVcyIsImV4cCI6MTU0ODIxNjgzOSwiaWF0IjoxNTQ4MjEzMjM5LCJ2ZXJzaW9uIjoyLCJqdGkiOiI5YjYwNGZjNC1jNTlmLTQ3NDctYTFmZC04Zjk4MGQ3MTNlYmUiLCJjbGllbnRfaWQiOiI2bWJ0cjNiYjJsZDdtM3RobzVjaWg4M2dnMiJ9.VrIs1BfSHHUQJvXr-6Wa1Sx6tqzx32SF-kvyWqisrbH62itsMKKkLbxEu1HPoEb2m99Jml-yMVN9LgZpg3zhfXdMpoCdlMPynBJ2aGdBq6wwUCHsmn0pRq0soZsTlpH3pHDJBNKMSPdUPArSJ3u3NySf7ZBxfi8tOtgVaWIxXQRyXSbk0AzDvAMvAY4Ol979iuLLKv0lYN6DiRFB-7fVcIxj0qCVa090h4qudGXbpD2KRzrMjDxzC14FaTsk35jJNZ8BXg6emDwb8U4q0nD9ICs__Bdnj3F1f0WPIBj57vo2efRe5UpHUk4UORvZheFNoFpAJ5-4UmbatGkTQj0ipQ'
};

fetch('https://cardpay.api.reddotpay.sg/v1/order/e2e45b87fe648242260de2b036171d1a/refund',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

sample = {
  id: '6ffe76b9ed0644c6e4d2d55fdd9dde32',
  account:
    { rid: 'rid:merchant:account/c215d0e7-7d6f-4dbf-9edb-5f08e260edca',
      type: 'maybank' },
    merchant: 'rid:merchant:merchant/90d587c6-ba1f-494e-a996-46b1559d811c',
    authorize: { amount: 1.02, currency: 'USD' },
    capture: { amount: 1.02, currency: 'USD' },
    refund: { amount: 0.03, currency: 'USD' },
    state: 'refund',
    customer:
    { token: 'rid:card:token/41111111-ede9acec-201e-40f9-b7f7-0935d90c3868' },
    transactions:
    [ { id: '641393-b5d102974a334b9ddb5809c0418c6d47',
        ledger: 'rid:veritas:entry/b5f063b89159fdd021da1ad95ebea50b390894a8d4e6dfc0fecd387e192809b4',
        amount: 0.01,
        currency: 'USD',
        action: 'refund',
        status: 'success',
        date: [Object] } ]
      }