import { processBasePay,
  processReimbursement,
  processBonus,
  processStockOptions,
  processPayDay,
  payrollEngineReducer } from '../src/index';

it('process base pay', () => {
  const action = processBasePay(10);
  const result = payrollEngineReducer(undefined, action);

  expect(result.basePay).toBe(10);
  expect(result.totalPay).toBe(10);
});

it('process reimbursement', () => {
  const action = processReimbursement(10);
  const result = payrollEngineReducer(undefined, action);

  expect(result.reimbursement).toBe(10);
  expect(result.totalPay).toBe(10);
});

it('process bonus', () => {
  const action = processBonus(10);
  const result = payrollEngineReducer(undefined, action);

  expect(result.bonus).toBe(10);
  expect(result.totalPay).toBe(10);
});

it('skip stock options', () => {
  const action = processStockOptions(10);
  const result = payrollEngineReducer(undefined, action);

  expect(result.stockOptions).toBe(0);
  expect(result.totalPay).toBe(0);
});

it('process stock options', () => {
  const oldAction = processBasePay(10);
  const oldState = payrollEngineReducer(undefined, oldAction);
  const action = processStockOptions(4);
  const result = payrollEngineReducer(oldState, action);

  expect(result.stockOptions).toBe(4);
  expect(result.totalPay).toBe(6);
});

it('process pay day', () => {
  const oldAction = processBasePay(10);
  const oldState = payrollEngineReducer(undefined, oldAction);
  const action = processPayDay();
  const result = payrollEngineReducer({...oldState, bonus: 10,
    reimbursement: 10}, action);

  expect(result.totalPay).toBe(10);
  expect(result.bonus).toBe(0);
  expect(result.reimbursement).toBe(0);
  expect(result.payHistory[0]).toBeDefined();
  expect(result.payHistory[0].totalCompensation).toBe(10);
  expect(result.payHistory[0].totalPay).toBe(10);
});

it('handles default branch', () => {
  const action = {type: 'INIT_ACTION'};
  const result = payrollEngineReducer(undefined, action);

  expect(result).toBeDefined();
});
