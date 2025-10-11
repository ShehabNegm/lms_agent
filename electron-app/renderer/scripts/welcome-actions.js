function runScript(scriptName) {
  const dateInput = document.getElementById('targetDate');
  const isoDate = dateInput ? dateInput.value : null;

  let formattedDate = null;
  if (isoDate) {
    const [year, month, day] = isoDate.split('-');
    formattedDate = `${day}/${month}/${year}`; // dd/mm/yyyy
  }

  console.log(`Running ${scriptName} with date: ${formattedDate}`);

  window.electronAPI.runAutomation({
    scriptName,
    args: formattedDate ? [formattedDate] : []
  });
}

