function renderGroups(groups) {
    Promise.resolve().then(() => {
        // $("#admin-group-list").attr('hidden', 'true');
        $("#admin-group-list").html('');
        groups.adminGroups.forEach((group) => {
            $('#admin-group-list').append(`
                <a href="/chat/${group}/a" class="list-group-item list-group-item-action">
                    ${group}
                </a>
            `);
        }
    )});

    Promise.resolve().then(() => {
        $("#member-group-list").html('');
        groups.memberGroups.forEach((group) => {
            $('#member-group-list').append(`
                <a href="/chat/${group}/m" class="list-group-item list-group-item-action">
                    ${group}
                </a>
            `);
        }
    )});
}

auth.onAuthStateChanged(user => {
    if (user) {
        user.getIdToken(true).then(function(idToken) {
            fetch('/groups/getGroups', {
                method: 'POST',
                headers: {
                    authorization: 'Bearer ' + idToken
                }
            }).then(res => res.json()).then(renderGroups);

          }).catch(function(error) {
            console.error(error)
          });
    }
})

async function createGroup(name) {
    console.log(name);

    const idToken = await firebase.auth().currentUser.getIdToken(true);

    fetch (`/groups/create/${name}`, {
        method: 'POST',

        headers: {
            authorization: 'Bearer ' + idToken
        }

    }).then(res => res.json()).then(() => location.reload());
}

$('#create-group-form').on('submit', (e) => {

    e.preventDefault();
    const name = document.getElementById('group-name').value;
    if (confirm(`Are you sure you would like to create a new group with the title: ${name}?`)) {
        createGroup(name);
    }
});