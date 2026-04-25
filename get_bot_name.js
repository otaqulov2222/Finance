const token = "8710400469:AAGDBAgub2j0exBctJdML6URw2-ad5G-0c0";

fetch(`https://api.telegram.org/bot${token}/getMe`)
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      console.log("BOT_USERNAME:", data.result.username);
    } else {
      console.error("Error:", data.description);
    }
  })
  .catch(err => console.error(err));
