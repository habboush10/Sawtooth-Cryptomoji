'use strict';

const { TransactionHandler } = require('sawtooth-sdk/processor/handler');
const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions');
const { decode } = require('./services/encoding');
const { createHash, randomBytes } = require('crypto');

const { getCollectionAddress } = require('./services/addressing');
const { encode } = require('./services/encoding');


const FAMILY_NAME = 'cryptomoji';
const FAMILY_VERSION = '0.1';
const NAMESPACE = '5f4d76';


const createOwner = (context, { name }, publicKey) => {
  const address = getCollectionAddress(publicKey);
  return context.getState([ address ]).then(state => {
    if (state[address].length > 0) {
      throw new InvalidTransaction('Owner already exists');
    }
    const update = {};
    update[address] = encode({ key: publicKey, moji: [] });// name is CREATE_OWNER
    return context.setState(update);
  });
}

const _unpackTransaction = (transaction) =>
  new Promise((resolve, reject) => {
    let header = TransactionHeader.decode(transaction.header)
    let signer = header.signerPublicKey
    try {
      let payload = _decodeData(transaction.payload)
      resolve({gameName: payload[0],
              action: payload[1],
              space: payload[2],
              signer: signer})
    } catch (err) {
      let reason =  new InvalidTransaction("Invalid payload serialization")
      reject(reason)
    }
  })



const _makeCollectionAddress = (collectionName) => {
  console.log(collectionName);
   let prefix = NAMESPACE;
   let collectionHash = createHash('sha512').update(collectionName._privateKey).digest('hex').toLowerCase()
   return prefix + collectionHash.substring(0, 62)
}


/**
 * A Cryptomoji specific version of a Hyperledger Sawtooth Transaction Handler.
 */
class MojiHandler extends TransactionHandler {
  /**
   * The constructor for a TransactionHandler simply registers it with the
   * validator, declaring which family name, versions, and namespaces it
   * expects to handle. We'll fill this one in for you.
   */
  constructor () {
    console.log('Initializing cryptomoji handler with namespace:', NAMESPACE);
    super(FAMILY_NAME, [ FAMILY_VERSION ], [ NAMESPACE ]);
  }

    /**
   * The apply method is where the vast majority of all the work of a
   * transaction processor happens. It will be called once for every
   * transaction, passing two objects: a transaction process request ("txn" for
   * short) and state context.
   *
   * Properties of `txn`:
   *   - txn.payload: the encoded payload sent from your client
   *   - txn.header: the decoded TransactionHeader for this transaction
   *   - txn.signature: the hex signature of the header
   *
   * Methods of `context`:
   *   - context.getState(addresses): takes an array of addresses and returns
   *     a Promise which will resolve with the requested state. The state
   *     object will have keys which are addresses, and values that are encoded
   *     state resources.
   *   - context.setState(updates): takes an update object and returns a
   *     Promise which will resolve with an array of the successfully
   *     updated addresses. The updates object should have keys which are
   *     addresses, and values which are encoded state resources.
   *   - context.deleteState(addresses): deletes the state for the passed
   *     array of state addresses. Only needed if attempting the extra credit.
   */

  apply (txn, context) {
    // Enter your solution here
    // (start by decoding your payload and checking which action it has)
    

    // console.log('*********--------------------****************');
    // console.log(_unpackTransaction(txn))




    // console.log('-----');
    // console.log(decode(txn.payload[1]));
    // console.log('-----');
    

    //let address = _makeCollectionAddress();
    
    let payload = null;
    try {
      payload = decode(txn.payload);
    } catch (err) {
      throw new InvalidTransaction('Unable to decode payload');
    }

    // if(payload.action === 'BAD'){
    //   //context._state[payload];
    //   throw new InvalidTransaction('Unable to decode payload');

    // }
    // // else if (payload.action === 'CREATE_COLLECTION') {
    //   context._state[payload];
    //   // return 
    //   // console.log('--------');
    //   // return console.log(context._state[]);
    //   // console.log('--------');
    //   // context.setState(payload._privateKey);

    //   //return createOwner(context, payload, txn.header.signerPublicKey);
    // } else 
    
    if(payload.action !== 'CREATE_COLLECTION') {
      throw new InvalidTransaction('Unknown action');
    }


    if (payload.action) {
    console.log('!@#$%^');

      // context.setState(payload._privateKey);
     const collectionAddress = _makeCollectionAddress(txn)

      const state_entries = context.getState([collectionAddress])
      return createOwner(context, payload, txn.header.signerPublicKey);
    } else {
      context._state[payload];
    }



    
  }
}

module.exports = MojiHandler;
