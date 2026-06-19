const nnavItems = document.querySelectorAll('.nnav-item');

nnavItems.forEach((item) => {
  const question = item.querySelector('.nnav-ques');
  if (!question) return;

  question.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const willOpen = !item.classList.contains('active');

    nnavItems.forEach((otherItem) => {
      otherItem.classList.remove('active');
      otherItem.querySelector('.nnav-ques')?.classList.remove('active');
    });

    if (willOpen) {
      item.classList.add('active');
      question.classList.add('active');
    }
  });
});
