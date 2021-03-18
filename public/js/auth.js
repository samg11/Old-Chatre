const signInBtn = $('.signInBtn');
const signOutBtn = $('.signOutBtn');

const whenSignedIn = $('.whenSignedIn');
const whenSignedOut = $('.whenSignedOut');

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

signInBtn.on("click", () => auth.signInWithRedirect(provider));
signOutBtn.on("click", () => auth.signOut());

auth.onAuthStateChanged(user => {
    if (user) {
        // signed in
        whenSignedIn.show();
        whenSignedOut.hide();
    } else {
        // not signed in
        whenSignedIn.hide();
        whenSignedOut.show();
    }
});