module.exports = {
    addDays(date, days) {
        let temp = new Date(date);
        temp.setDate(temp.getDate() + days);
    
        let dd = temp.getDate();
        let mm = temp.getMonth() + 1;
        let yyyy = temp.getFullYear();
    
        return yyyy + '-' + mm + '-'+ dd;
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