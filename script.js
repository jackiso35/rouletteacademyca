document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const chatContainer = document.getElementById("chat-container");
    const chatMessages = document.getElementById("chat-messages");
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");
    const emojiBar = document.getElementById("emoji-bar");
    const currentUsernameSpan = document.getElementById("current-username");
    const userAvatarImg = document.getElementById("user-avatar");
    const snowContainer = document.getElementById("snow");
   


// Ses dosyası
const messageSound = new Audio("sounds/message_received.mp3");





    const maxSnowflakes = 50; // Maksimum kar tanesi sayısı

    function createSnowflake() {
        if (snowContainer.childElementCount >= maxSnowflakes) {
            return; // Maksimum kar tanesi sınırına ulaşıldıysa yeni kar tanesi ekleme
        }
    
        const snowflake = document.createElement("div");
        snowflake.classList.add("snowflake");
        snowflake.textContent = "❄";
        snowflake.style.left = Math.random() * window.innerWidth + "px"; // Rastgele yatay konum
        snowflake.style.animationDuration = Math.random() * 3 + 7 + "s"; // Karın düşme süresi
        snowflake.style.fontSize = Math.random() * 10 + 10 + "px"; // Kar tanesi boyutu
        snowflake.style.opacity = Math.random(); // Rastgele saydamlık
    
        snowContainer.appendChild(snowflake);
    
        setTimeout(() => {
            snowflake.remove(); // Kar tanesini 10 saniye sonra DOM'dan kaldır
        }, 10000);
    }
    
    setInterval(createSnowflake, 300); // Her 300ms'de bir yeni kar tanesi




    const icons = [
        " icon1.png",
        "frontend/public/icons/icon2.png",
        "frontend/public/icons/icon3.png",
        "frontend/public/icons/icon4.png",
        "frontend/public/icons/icon5.png",
        "frontend/public/icons/icon6.png",
    ];
    const userIcons = {}; // Kullanıcı ikonlarını saklamak için
    const messageQueue = [];
    let currentUser = JSON.parse(localStorage.getItem("chatUser")) || null;
    let botQueue = []; // Bot mesajlarını tutmak için kuyruk
let messages = []; // Tüm mesajları tutmak için liste (Telegram + kullanıcı mesajları)


    const bots = [
        { name: "Academybot", icon: "public/moderator.png", message: "Telegram group: <a href='https://t.me/rouletteacademycanada'>Click</a>" },
        { name: "StakeBot", icon: "public/slotticabot.png", message: "Best Casino Go: <a href='https://stake.com/?c=9dd9dbc553'>Click</a>" },
        { name: "Slotticabot", icon: "slotticabot.png", message: "Best Casino Go: <a href='https://gopartner.link/?a=205678&c=184089&s1=6028'>Click</a>" },
        { name: "BetsioBot", icon: "slotticabot.png", message: "Best Casino Go: <a href='https://t.ly/9-D_G'>Click</a>" },
    ];

    const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    savedMessages.forEach(({ user, text, icon }) => addMessage(user, text, icon));

    if (currentUser) {
        startChat(currentUser);
    }







    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("login-username").value.trim();
        const email = document.getElementById("login-email").value.trim();

        if (!username || !email || !email.includes("@gmail.com")) {
            alert("Lütfen geçerli bir kullanıcı adı ve Gmail adresi girin.");
            return;
        }

        // Rastgele bir ikon ata
        const userIcon = icons[Math.floor(Math.random() * icons.length)];

        const userData = {
            username,
            email,
            icon: userIcon,
        };

        // Kullanıcı bilgilerini kaydet ve sohbeti başlat
        localStorage.setItem("chatUser", JSON.stringify(userData));
        startChat(userData);
    });

// Chat başlatma fonksiyonu
function startChat(user) {
    loginForm.style.display = "none";
    chatContainer.style.display = "block";
    currentUsernameSpan.textContent = user.username;
    userAvatarImg.src = user.icon;

    chatMessages.scrollTop = chatMessages.scrollHeight;

    initializeBots(); // Bot mesajlarını başlat
    fetchTelegramMessages(); // Telegram mesajlarını düzenli olarak çek
    processBotQueue(); // Bot kuyruğunu işleme başlat
}

// Bot mesajlarını kuyruğa ekleme
function initializeBots() {
    bots.forEach((bot) => {
        botQueue.push(bot); // Tüm bot mesajlarını kuyruğa ekle
    });

    // Her 60 saniyede bir bot kuyruğuna yeni mesajlar ekle
    setInterval(() => {
        bots.forEach((bot) => {
            botQueue.push(bot);
        });
    }, 60000);
}

// Bot kuyruğunu işleme
function processBotQueue() {
    if (botQueue.length > 0) {
        const bot = botQueue.shift(); // Kuyruktan ilk bot mesajını al
        addMessage(bot.name, bot.message, bot.icon); // Bot mesajını chat ekranına ekle
    }

    // Her 5 saniyede bir bot mesajını işleme
    setTimeout(processBotQueue, 5000);
}
    // Emoji tıklama olayını dinle
    emojiBar.addEventListener("click", (e) => {
        if (e.target.classList.contains("emoji")) {
            const emoji = e.target.textContent; // Tıklanan emojiyi al
            messageInput.value += emoji; // Mesaj giriş kutusuna ekle
            messageInput.focus(); // Giriş kutusuna odaklan
        }
    });
 
    // Mesaj gönderme işlemi
    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        const icon = currentUser.icon || "icon1.png";
        addMessage(currentUser.username, message, icon);

        saveMessage(currentUser.username, message, icon);

        messageInput.value = "";
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Enter tuşuyla mesaj gönderme
    messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    });
        // Gönder butonuyla mesaj gönderme
    sendButton.addEventListener("click", sendMessage);

        // Mesajı ekrana yazdırma
    function addMessage(user, text, icon) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        
        // Kullanıcıya ikon atanmadıysa rastgele ikon seç
        const userIcon = icon || userIcons[user] || (userIcons[user] = icons[Math.floor(Math.random() * icons.length)]);

        messageDiv.innerHTML = `
        <div class="profile">
            <img src="${userIcon}" alt="Avatar" class="avatar">
            <span class="username">${user}:</span>
        </div>
        <div class="content">${text}</div>
    `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        // Gelen mesajda ses çal
        messageSound.play();
    }

    function saveMessage(user, text, icon) {
        savedMessages.push({ user, text, icon });
        localStorage.setItem("chatMessages", JSON.stringify(savedMessages));
    }
// Telegram mesajlarını çekme ve direkt ekrana yazdırma
function fetchTelegramMessages() {
    fetch("http://185.205.209.130:5000/get_messages")
        .then((response) => response.json())
        .then((data) => {
            data.forEach((msg) => {
                // Kullanıcı için ikon atanmış mı kontrol et, yoksa rastgele bir ikon ata
                const icon = userIcons[msg.author] || (userIcons[msg.author] = icons[Math.floor(Math.random() * icons.length)]);
                addMessage(msg.author, msg.content, icon); // Mesajı ekrana yazdır
            });
        })
        .catch((error) => console.error("Telegram mesajları alınırken hata oluştu:", error));
}





    // Telegram mesajlarını her 5 saniyede bir çek
    setInterval(fetchTelegramMessages, 5000);
});
