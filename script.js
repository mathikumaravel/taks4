    const form = document.getElementById('form');
    const list = document.getElementById('list');
    const descriptionEl = document.getElementById('description');
    const amountEl = document.getElementById('amount');
    const typeEl = document.getElementById('type');
    const balanceEl = document.getElementById('balance');
    const incomeEl = document.getElementById('income');
    const expenseEl = document.getElementById('expense');
    const resetBtn = document.getElementById('reset');
    const filterRadios = document.querySelectorAll('input[name="filter"]');

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let editingId = null;

    function updateOverview() {
      const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const balance = income - expense;

      incomeEl.textContent = `+${income.toFixed(2)}`;
      expenseEl.textContent = `-${expense.toFixed(2)}`;
      balanceEl.textContent = `${balance.toFixed(2)}`;
    }

    function renderList(filter = 'all') {
      list.innerHTML = '';

      const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter);

      filtered.forEach(tx => {
        const li = document.createElement('li');
        li.className = tx.type === 'income' ? 'income-item' : 'expense-item';

        li.innerHTML = `
          ${tx.description} <span>$${tx.amount.toFixed(2)}</span>
          <div class="actions">
            <button class="edit" onclick="editTx(${tx.id})"> Edit </button>
            <button class="delete" onclick="deleteTx(${tx.id})"> Delete </button>
          </div>
        `;

        list.appendChild(li);
      });

      updateOverview();
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function addOrUpdateTx(e) {
      e.preventDefault();
      const desc = descriptionEl.value.trim();
      const amt = parseFloat(amountEl.value);
      const type = typeEl.value;

      if (!desc || isNaN(amt) || !type) return;

      if (editingId) {
        transactions = transactions.map(tx =>
          tx.id === editingId ? { id: tx.id, description: desc, amount: amt, type } : tx
        );
        editingId = null;
      } else {
        transactions.push({
          id: Date.now(),
          description: desc,
          amount: amt,
          type
        });
      }

      form.reset();
      renderList(getSelectedFilter());
    }

    function editTx(id) {
      const tx = transactions.find(t => t.id === id);
      if (tx) {
        descriptionEl.value = tx.description;
        amountEl.value = tx.amount;
        typeEl.value = tx.type;
        editingId = id;
      }
    }

    function deleteTx(id) {
      transactions = transactions.filter(tx => tx.id !== id);
      renderList(getSelectedFilter());
    }

    function getSelectedFilter() {
      return document.querySelector('input[name="filter"]:checked').value;
    }

    filterRadios.forEach(radio => {
      radio.addEventListener('change', () => renderList(getSelectedFilter()));
    });

    resetBtn.addEventListener('click', () => form.reset());
    form.addEventListener('submit', addOrUpdateTx);

    renderList();
