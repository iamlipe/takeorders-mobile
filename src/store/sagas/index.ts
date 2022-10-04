import { all } from 'redux-saga/effects';

import userSaga from './userSaga';
import stockSaga from './stockSaga';
import spentSaga from './spentSaga';
import purchaseSaga from './purchaseSaga';
import productSaga from './productSaga';
import orderSaga from './orderSaga';
import invoiceSaga from './invoiceSaga';
import clientSaga from './clientSaga';
import billSaga from './billSaga';
import saleSaga from './saleSaga';

function* rootSaga() {
  yield all([
    userSaga(),
    stockSaga(),
    spentSaga(),
    invoiceSaga(),
    purchaseSaga(),
    productSaga(),
    orderSaga(),
    clientSaga(),
    billSaga(),
    saleSaga(),
  ]);
}

export default rootSaga;
