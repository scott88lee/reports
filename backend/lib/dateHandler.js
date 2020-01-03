module.exports = {
    addDays(date, days) {
        let temp = new Date(date);
        temp.setDate(temp.getDate() + days);
        return temp;
    },
    toUTC(dateTime, hours){
        let temp = new Date(dateTime);
        temp.setHours(temp.getHours() + hours);
    
        return temp;
    }
}

function toUTC(dateTime, hours){
    let temp = new Date(dateTime);
    temp.setHours(temp.getHours() + hours);

    return temp;
}

console.log(toUTC('2018-12-29T23:51:00Z', -1));