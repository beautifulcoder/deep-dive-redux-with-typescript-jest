import { createStore } from 'redux';

const BASE_PAY = 'BASE_PAY';
const REIMBURSEMENT = 'REIMBURSEMENT';
const BONUS = 'BONUS';
const STOCK_OPTIONS = 'STOCK_OPTIONS';
const PAY_DAY = 'PAY_DAY';

interface PayrollAction {
  type: string;
  amount?: number;
}

interface PayHistoryState {
  totalPay: number;
  totalCompensation: number;
}

interface PayStubState {
  basePay: number;
  reimbursement: number;
  bonus: number;
  stockOptions: number;
  totalPay: number;
  payHistory: Array<PayHistoryState>;
}

export const processBasePay = (amount: number): PayrollAction =>
  ({type: BASE_PAY, amount});
export const processReimbursement = (amount: number): PayrollAction =>
  ({type: REIMBURSEMENT, amount});
export const processBonus = (amount: number): PayrollAction =>
  ({type: BONUS, amount});
export const processStockOptions = (amount: number): PayrollAction =>
  ({type: STOCK_OPTIONS, amount});
export const processPayDay = (): PayrollAction =>
  ({type: PAY_DAY});

const initialState: PayStubState = {
  basePay: 0, reimbursement: 0,
  bonus: 0, stockOptions: 0,
  totalPay: 0, payHistory: []
};

const computeTotalPay = (payStub: PayStubState) =>
  payStub.totalPay >= payStub.stockOptions
  ? payStub.basePay + payStub.reimbursement
    + payStub.bonus - payStub.stockOptions
  : payStub.totalPay;

export const payrollEngineReducer = (
  state: PayStubState = initialState,
  action: PayrollAction): PayStubState => {
  let totalPay: number = 0;

  switch (action.type) {
    case BASE_PAY:
      const {amount: basePay = 0} = action;
      totalPay = computeTotalPay({...state, basePay});

      return {...state, basePay, totalPay};

    case REIMBURSEMENT:
      const {amount: reimbursement = 0} = action;
      totalPay = computeTotalPay({...state, reimbursement});

      return {...state, reimbursement, totalPay};

    case BONUS:
      const {amount: bonus = 0} = action;
      totalPay = computeTotalPay({...state, bonus});

      return {...state, bonus, totalPay};

    case STOCK_OPTIONS:
      const {amount: stockOptions = 0} = action;
      totalPay = computeTotalPay({...state, stockOptions});

      const newStockOptions = totalPay >= stockOptions
        ? stockOptions : 0;

      return {...state, stockOptions: newStockOptions, totalPay};

    case PAY_DAY:
      const {payHistory} = state;
      totalPay = state.totalPay;

      const lastPayHistory = payHistory.slice(-1).pop();
      const lastTotalCompensation = (lastPayHistory
        && lastPayHistory.totalCompensation) || 0;
      const totalCompensation = totalPay + lastTotalCompensation;

      const newTotalPay = computeTotalPay({...state,
        reimbursement: 0, bonus: 0});
      const newPayHistory = [...payHistory, {totalPay, totalCompensation}];

      return {...state, reimbursement: 0, bonus: 0,
        totalPay: newTotalPay, payHistory: newPayHistory};

    default:
      return state;
  }
};

if (!process.env.JEST_WORKER_ID) {
  const store = createStore(payrollEngineReducer, initialState);
  const unsubscribe = store.subscribe(() => console.log(store.getState()));

  store.dispatch(processBasePay(300));
  store.dispatch(processReimbursement(50));
  store.dispatch(processBonus(100));
  store.dispatch(processStockOptions(15));
  store.dispatch(processPayDay());

  store.dispatch(processReimbursement(50));
  store.dispatch(processPayDay());

  store.dispatch(processPayDay());

  unsubscribe();
}
