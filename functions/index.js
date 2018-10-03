const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

function groups(user) {
    return db
        .collection('groups')
        .where('users', 'array-contains', user)
        .get()
}

exports.updateGroupTotal = functions
    .firestore
    .document('users/{user}')
    .onUpdate((change, context) => {
        const amount = change.after.get('drinks') - change.before.get('drinks');

        return db.runTransaction(transaction => {
            return groups(change.before.ref).then(groups => {
                groups.forEach(group => {
                    transaction.update(group.ref, {
                        drinks: (group.get('drinks') || 0) + amount
                    });
                });
            })
        })
    });
