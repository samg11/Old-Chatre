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

        db.collection("groups").doc(groupName).collection('messages').orderBy('date_created', 'desc').limit(20)
        .onSnapshot(async (col) => {
            $('#messages').html('');
            col.forEach(doc => {
                const msg = doc.data();

                const initials = (name) => (
                    name.split(' ').map(n => n.charAt(0)).join('')
                )

                const timeSinceElement = $(document).width() >= 992 ? 
                    $("<div></div>")
                        .addClass('time-since p-2 bd-highlight')
                        .text(moment(new Date(msg.date_created)).fromNow())
                    :''

                $('#messages')
                    .prepend(
                        $("<div></div>")
                            .addClass('message d-flex bd-highlight mb-3 justify-content-between')
                            
                            .append(
                                $('<div></div>')
                                    .html(
                                        $('<img>')
                                            .addClass('user-icon')
                                            .attr('src', msg.userIcon)
                                    )
                                    .addClass('user-icon-container bd-highlight')
                            )

                            .append(
                                $("<div></div>")
                                    .addClass('user p-2 bd-highlight')
                                    .html(
                                        $('<span></span>')
                                            .addClass('user-text')
                                            .text($(document).width() >= 992 ? msg.posted_by : initials(msg.posted_by))
                                        )
                            )

                            .append(
                                $("<div></div>")
                                    .addClass('text p-2 bd-highlight flex-grow-1 text-break')
                                    .text(msg.text)
                            )
                            
                            .append(timeSinceElement)

                            
                    );
            });
            $('#messages').scrollTop($('#messages')[0].scrollHeight);
        });
    }
})


$("#viewMembersCollapseButton").on('click', () => $("#viewMembersCollapse").collapse('toggle'));

auth.onAuthStateChanged(async (user) => {
    if (user) {
        
    }
});

// ADMIN CONTROLS
if (rank === 'admin') {
    $("#addMemberCollapseButton").on('click', () => $("#addMemberCollapse").collapse('toggle'));

    $('#addMemberForm').on('submit', async (e) => {
        e.preventDefault();
        const authToken = await auth.currentUser.getIdToken(true);
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
        }).then(res => res.json());

        console.log(res);
        if (res.error) {
            alert(res.msg);
        } else {
            alert(res.msg);
        }
    });
}

