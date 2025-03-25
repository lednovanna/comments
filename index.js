
document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.getElementById('commentForm');
    const commentList = document.getElementById('commentList');

    // Функция для  нового комментария
    function createComment(text, parentId = null, timestamp = new Date()) {
        const commentItem = document.createElement('li');
        commentItem.className = 'comment-item';

        const content = document.createElement('p');
        content.textContent = `${text} (Added: ${timestamp.toLocaleString()})`;

        const replyButton = document.createElement('button');
        replyButton.textContent = 'Reply';

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';

        const replyForm = document.createElement('form');
        replyForm.innerHTML = '<input type="text" placeholder="Your reply" required><button>Add reply</button>';
        replyForm.style.display = 'none';

        const replyList = document.createElement('ul');

        commentItem.appendChild(content);
        commentItem.appendChild(replyButton);
        commentItem.appendChild(deleteButton);
        commentItem.appendChild(replyForm);
        commentItem.appendChild(replyList);

        // Ответ
        replyButton.addEventListener('click', () => {
            replyForm.style.display = replyForm.style.display === 'none' ? 'block' : 'none';
        });

        replyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const replyInput = replyForm.querySelector('input');
            if (replyInput.value.trim()) {
                const replyComment = createComment(replyInput.value.trim(), parentId || text);
                replyList.appendChild(replyComment);
                saveComments();
                replyInput.value = '';
            }
        });

        // Удаление
        deleteButton.addEventListener('click', () => {
            commentItem.remove();
            saveComments();
        });

        return commentItem;
    }

    // Сохраняем коментарии в LocalStorage
    function saveComments() {
        const comments = [];
        function traverseComments(list, parentId = null) {
            list.childNodes.forEach(item => {
                if (item.className === 'comment-item') {
                    const text = item.querySelector('p').textContent.split(' (Added: ')[0];
                    const timestamp = new Date();
                    comments.push({ text, parentId, timestamp });
                    const replies = item.querySelector('ul');
                    traverseComments(replies, text);
                }
            });
        }
        traverseComments(commentList);
        localStorage.setItem('comments', JSON.stringify(comments));
    }

    // Выгрузка с LocalStorage
    function loadComments() {
        const savedComments = JSON.parse(localStorage.getItem('comments')) || [];
        function buildComments(parentId = null) {
            return savedComments
                .filter(comment => comment.parentId === parentId)
                .map(comment => {
                    const item = createComment(comment.text, comment.parentId, new Date(comment.timestamp));
                    const replies = buildComments(comment.text);
                    replies.forEach(reply => item.querySelector('ul').appendChild(reply));
                    return item;
                });
        }
        buildComments().forEach(comment => commentList.appendChild(comment));
    }

    // Добавление нового комментария
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const commentInput = document.getElementById('commentInput');
        if (commentInput.value.trim()) {
            const newComment = createComment(commentInput.value.trim());
            commentList.appendChild(newComment);
            saveComments();
            commentInput.value = '';
        }
    });

    loadComments();
});
