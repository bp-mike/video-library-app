const {sum, subtract, multiply, divide} = require('../calculator.js')

test('sum of two numbers', ()=>{
    expect(sum(1, 2)).toBe(3);
})

test('subtraction of two numbers', ()=>{
    expect(subtract(2, 1)).toBe(1);
})

test('multiplication of two numbers', ()=>{
    expect(multiply(3, 2)).toBe(6);
})

test('division of two numbers', ()=>{
    expect(divide(6, 3)).toBe(2);
})