const db = firebase.firestore();
// const auth = firebase.auth();

$('#chat-bar').on('submit', async (e) => {
    e.preventDefault();
    const authToken = await auth.currentUser.getIdToken(true);
    fetch(`/chat/${groupName}/sendmsg`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify({
            text: $('#msgText').val()
        })
    })
        .then((res) => console.log(res))
        .catch(console.error)
        .finally(() => $('#msgText').val(''))
});

auth.onAuthStateChanged(user => {
    if (user) {
        db.collection("groups").doc(groupName).collection('messages').orderBy('date_created', 'desc').limit(20)
        .onSnapshot(async (col) => {
            $('#messages').html('');
            col.forEach(doc => {
                const msg = doc.data();
                const timeSince = moment(new Date(msg.date_created)).fromNow();

                const timeSinceElement = $(document).width() >= 992 ? $("<div></div>")
                    .addClass('timeSince p-2 bd-highlight')
                    .text(timeSince)
                    :''

                $('#messages')
                    .prepend(
                        $("<div></div>")
                            .addClass('message d-flex bd-highlight mb-3 justify-content-between')
                            
                            .append(
                                $("<div></div>")
                                    .addClass('user p-2 bd-highlight')
                                    .text(msg.posted_by)
                            )

                            .append(
                                $("<div></div>")
                                    .addClass('text p-2 bd-highlight flex-grow-1')
                                    .text(msg.text)
                            )
                            
                            .append(timeSinceElement)

                            
                    );
            });
            $('#messages').scrollTop($('#messages')[0].scrollHeight);
        });
    }
})


// ADMIN CONTROLS
$("#viewMembersCollapseButton").on('click', () => $("#viewMembersCollapse").collapse('toggle'));

auth.onAuthStateChanged(async (user) => {
    if (user) {
        const authToken = await user.getIdToken(true);
        console.log(authToken);
        const members = await fetch(`/chat/${groupName}/getMembers`, {
            method: 'POST',
            'headers' : {
                'Content-Type': 'application/json',
                'authorization': 'Bearer ' + authToken
            }
        }).then(res => res.json());

        console.log(members);
        members.forEach(member => {
            $('#members').append(`
                <li data-toggle="tooltip" data-placement="bottom" title="${member[0]}">
                    ${member[1]}
                </li>
            `);
        });
    }
});

if (rank === 'admin') {
    $("#addMemberCollapseButton").on('click', () => $("#addMemberCollapse").collapse('toggle'));

    $('#addMemberForm').on('submit', async (e) => {
        e.preventDefault();
        const authToken = await auth.currentUser.getIdToken(true);
        console.log(authToken);
        console.log($('#userEmail').val());
        const res = await fetch(`/chat/${groupName}/add-member`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authorization: 'Bearer ' + authToken
            },
            body: JSON.stringify({
                userEmail: $('#userEmail').val()
            })
        }).then(res => res.status);

        console.log(res);
        if (res.error) {
            alert(res.msg);
        }
    });
}

