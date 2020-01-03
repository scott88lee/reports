let date = Date.parse('2018-02-02');
console.log(date);

let d = new Date();
let offset = d.getTimezoneOffset() * 60000;

let x = date + offset;

console.log(x)

let y = new Date(x)
console.log(y)