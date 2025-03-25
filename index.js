

document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.getElementById('commentForm');
    const commentList = document.getElementById('commentList');

    
    const createComment = (text, parentId = null, timestamp = new Date()) => {
        const commentItem = document.createElement('li');
        commentItem.className = 'comment-item';

        commentItem.innerHTML = `
            <p>${text} (Додано: ${timestamp.toLocaleString()})</p>
            <button class="reply-btn">Reply</button>
            <button class="delete-btn">Delete</button>
            <form class="reply-form" style="display: none;">
                <input type="text" placeholder="Your reply" required>
                <button type="submit">Add reply</button>
            </form>
            <ul class="reply-list"></ul>
        `;

        const replyBtn = commentItem.querySelector('.reply-btn');
        const deleteBtn = commentItem.querySelector('.delete-btn');
        const replyForm = commentItem.querySelector('.reply-form');
        const replyInput = replyForm.querySelector('input');
        const replyList = commentItem.querySelector('.reply-list');

        replyBtn.addEventListener('click', () => {
            replyForm.style.display = replyForm.style.display === 'none' ? 'block' : 'none';
        });

        replyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (replyInput.value.trim()) {
                replyList.appendChild(createComment(replyInput.value.trim(), text));
                saveComments();
                replyInput.value = '';
            }
        });

        deleteBtn.addEventListener('click', () => {
            commentItem.remove();
            saveComments();
        });

        return commentItem;
    };

    // сохранение в  localStorage
    const saveComments = () => {
        const comments = [];

        const traverseComments = (list, parentId = null) => {
            list.querySelectorAll('.comment-item').forEach(item => {
                const text = item.querySelector('p').childNodes[0].textContent.trim();
                const timestamp = item.getAttribute('data-timestamp') || new Date().toISOString();
                comments.push({ text, parentId, timestamp });
                traverseComments(item.querySelector('.reply-list'), text);
            });
        };

        traverseComments(commentList);
        localStorage.setItem('comments', JSON.stringify(comments));
    };

    
    const loadComments = () => {
        const savedComments = JSON.parse(localStorage.getItem('comments')) || [];

        const buildComments = (parentId = null) => {
            return savedComments
                .filter(comment => comment.parentId === parentId)
                .map(comment => {
                    const item = createComment(comment.text, comment.parentId, new Date(comment.timestamp));
                    buildComments(comment.text).forEach(reply => item.querySelector('.reply-list').appendChild(reply));
                    return item;
                });
        };

        buildComments().forEach(comment => commentList.appendChild(comment));
    };

    // добавление нового комментария
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const commentInput = document.getElementById('commentInput');

        if (commentInput.value.trim()) {
            commentList.appendChild(createComment(commentInput.value.trim()));
            saveComments();
            commentInput.value = '';
        }
    });

    loadComments();
});

