const signInBtn = $('.signInBtn');
const signOutBtn = $('.signOutBtn');

const whenSignedIn = $('.whenSignedIn');
const whenSignedOut = $('.whenSignedOut');

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

signInBtn.on("click", () => auth.signInWithRedirect(provider));
signOutBtn.on("click", () => {
    auth.signOut();
    window.location.pathname = '/'; // Return to homepage when signed out
});

auth.onAuthStateChanged(user => {
    if (user) {
        // signed in
        whenSignedIn.attr('hidden', false);
        whenSignedOut.attr('hidden', true);
        $('img.profilePic').attr('src', user.photoURL)
    } else {
        // not signed in
        whenSignedIn.attr('hidden', true);
        whenSignedOut.attr('hidden', false);
    }
});