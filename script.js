// Lägg till detta i din befintliga JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const hamburgerDropdown = document.getElementById('hamburgerDropdown');
   
    // Toggle dropdown
    hamburgerBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        hamburgerBtn.classList.toggle('open');
        hamburgerDropdown.classList.toggle('open');
    });
   
    // Stäng dropdown när man klickar utanför
    document.addEventListener('click', function(e) {
        if (!hamburgerBtn.contains(e.target) && !hamburgerDropdown.contains(e.target)) {
            hamburgerBtn.classList.remove('open');
            hamburgerDropdown.classList.remove('open');
        }
    });
   
    // Stäng dropdown med ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && hamburgerDropdown.classList.contains('open')) {
            hamburgerBtn.classList.remove('open');
            hamburgerDropdown.classList.remove('open');
        }
    });

    // NYTT: Stäng dropdown när man klickar på en länk
    if (hamburgerDropdown) {
        const dropdownLinks = hamburgerDropdown.querySelectorAll('a[href]:not([href="#"])');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburgerBtn.classList.remove('open');
                hamburgerDropdown.classList.remove('open');
            });
        });
    }
});












const newsContainer = document.getElementById('news-container');

// Flera svenska RSS-källor för mer innehåll (utan SVT, SvD och Expressen)
const RSS_SOURCES = {
  sverige: [
    'https://www.dn.se/rss/sverige/',
  ],
  utrikes: [
    'https://www.dn.se/rss/varlden/',
  ]
};

function fetchRss(rssUrl) {
  const apiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssUrl);
  return fetch(apiUrl)
    .then(response => response.json())
    .catch(error => {
      console.warn(`Fel vid hämtning från ${rssUrl}:`, error);
      return { items: [] }; // Returnera tom array istället för att krascha
    });
}

function getImageUrl(item) {
  if (item.thumbnail) {
    return item.thumbnail;
  } else if (item['media:content']) {
    if (Array.isArray(item['media:content'])) {
      return item['media:content'][0].url || '';
    } else if (typeof item['media:content'] === 'object') {
      return item['media:content'].url || '';
    }
  } else if (item.enclosure && item.enclosure.link) {
    return item.enclosure.link;
  }
  return '';
}

function getSourceName(link) {
  console.log('Checking link:', link); // Debug för att se vad som kommer in
  
  if (link.includes('dn.se')) return 'DN';
  
  // Fallback: försök extrahera domän från URL
  try {
    const url = new URL(link);
    const hostname = url.hostname.toLowerCase();
    
    if (hostname.includes('dn')) return 'DN';
    
    // Om inget matchar, returnera domännamnet istället för "Okänd källa"
    return hostname.replace('www.', '').toUpperCase();
  } catch (e) {
    return 'Okänd källa';
  }
}

// Utökad funktion för att få mer detaljerad källinformation
function getDetailedSourceInfo(link) {
  const url = new URL(link);
  const hostname = url.hostname.toLowerCase();
  
  if (hostname.includes('dn.se')) {
    return {
      name: 'Dagens Nyheter',
      shortName: 'DN',
      description: 'Sveriges ledande morgontidning sedan 1864',
      type: 'Dagstidning',
      founded: '1864',
      website: 'dn.se'
    };
  }
  
  // Fallback för okända källor
  return {
    name: hostname.replace('www.', '').charAt(0).toUpperCase() + hostname.replace('www.', '').slice(1),
    shortName: hostname.replace('www.', '').toUpperCase(),
    description: 'Nyhetskälla',
    type: 'Webbplats',
    founded: 'Okänt',
    website: hostname.replace('www.', '')
  };
}

// Hjälpfunktion för att beräkna tid sedan publicering
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Precis nu';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minut${minutes === 1 ? '' : 'er'} sedan`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} timm${hours === 1 ? 'e' : 'ar'} sedan`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} dag${days === 1 ? '' : 'ar'} sedan`;
  } else {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} veck${weeks === 1 ? 'a' : 'or'} sedan`;
  }
}

function openFocusMode(item) {
  document.body.classList.add('modal-open');
  
  const modal = document.createElement('div');
  modal.classList.add('modal');
  
  const imageUrl = getImageUrl(item);
  const imageHtml = imageUrl 
    ? `<div class="modal-image"><img src="${imageUrl}" alt="Bild till nyhet" /></div>`
    : '';
    
  const sourceInfo = getDetailedSourceInfo(item.link);
  
  // Visa hela beskrivningen utan trunkering
  const fullDescription = item.description ? item.description.replace(/(<([^>]+)>)/gi, "") : "Ingen beskrivning tillgänglig från denna källa.";
  
  // Formatera publiceringsdatum
  const publishDate = new Date(item.pubDate);
  const timeAgo = getTimeAgo(publishDate);
  const formattedDate = publishDate.toLocaleString('sv-SE');
    
  modal.innerHTML = `
    <div class="modal-content">
      <button class="close-modal">&times;</button>
      
      <h2 class="modal-title">${item.title}</h2>
      ${imageHtml}
      
      <div class="modal-text">${fullDescription}</div>
      
      <div class="modal-source-header">
        <div class="source-info">
          <div class="source-name">${sourceInfo.name}</div>
          <div class="source-details">
            <span class="source-type">${sourceInfo.type}</span>
            <span class="source-divider">•</span>
            <span class="source-website">${sourceInfo.website}</span>
          </div>
          <div class="source-description">${sourceInfo.description}</div>
        </div>
      </div>
      
      <div class="article-meta">
        <div class="publish-info">
          <div class="publish-date">${formattedDate}</div>
          <div class="time-ago">${timeAgo}</div>
        </div>
      </div>
      
      <div class="modal-footer">
        <div class="footer-source-info">
          <small>Källa: ${sourceInfo.name} (${sourceInfo.founded})</small>
        </div>
        <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="read-more-btn">
          Läs hela artikeln på ${sourceInfo.shortName}
        </a>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const closeBtn = modal.querySelector('.close-modal');
  closeBtn.addEventListener('click', closeFocusMode);
  
  document.addEventListener('keydown', handleEscClose);
  modal.addEventListener('click', handleOutsideClick);
}

function closeFocusMode() {
  const modal = document.querySelector('.modal');
  if (modal) {
    document.body.classList.remove('modal-open');
    document.body.removeChild(modal);
    document.removeEventListener('keydown', handleEscClose);
  }
}

function handleEscClose(e) {
  if (e.key === 'Escape') {
    closeFocusMode();
  }
}

function handleOutsideClick(e) {
  if (e.target.classList.contains('modal')) {
    closeFocusMode();
  }
}

function createNewsItem(item) {
  const imageUrl = getImageUrl(item);
  const imageHtml = imageUrl
    ? `<div class="news-image"><img src="${imageUrl}" alt="Bild till nyhet" onerror="this.parentElement.style.display='none'" /></div>`
    : `<div class="news-image placeholder-image"><div class="placeholder-text">Ingen bild</div></div>`;

  const sourceName = getSourceName(item.link);
  
  const newsItem = document.createElement('article');
  newsItem.classList.add('news-item');

  newsItem.innerHTML = `
    <div class="news-source">${sourceName}</div>
    <div class="news-title">${item.title}</div>
    ${imageHtml}
    <div class="news-content">${item.description ? item.description.replace(/(<([^>]+)>)/gi, "").substring(0, 300) + "..." : ""}</div>
    <small>${getTimeAgo(new Date(item.pubDate))}</small>
  `;

  newsItem.addEventListener('click', (e) => {
    e.preventDefault();
    openFocusMode(item);
  });

  return newsItem;
}

// Funktion för att sortera artiklar konsistent (efter datum, nyast först)
function sortAndLimit(items, minItems = 40, maxItems = 50) {
  // Sortera efter publiceringsdatum, nyast först
  const sorted = items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  // Säkerställ att vi alltid har minst minItems artiklar (om tillgängligt)
  const targetCount = Math.max(minItems, Math.min(items.length, maxItems));
  return sorted.slice(0, targetCount);
}

// Visa laddningsindikator
function showLoading() {
  newsContainer.innerHTML = `
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>Hämtar nyheter från flera källor...</p>
    </div>
  `;
}

(async function() {
  try {
    showLoading();
    
    let rssUrls;
    const cacheKey = window.location.pathname;
    const cacheTime = 10 * 60 * 1000; // 10 minuter cache
    
    // Kontrollera cache först, men rensa om vi har fel källor
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTimestamp = localStorage.getItem(cacheKey + '_timestamp');
    
    // Kontrollera om cachad data innehåller gamla källor som vi inte vill ha
    if (cachedData) {
      const newsItems = JSON.parse(cachedData);
      const hasOldSources = newsItems.some(item => 
        item.link.includes('expressen.se') || 
        item.link.includes('svd.se') || 
        item.link.includes('svt.se')
      );
      
      if (hasOldSources) {
        console.log('Rensar cache pga gamla källor');
        localStorage.removeItem(cacheKey);
        localStorage.removeItem(cacheKey + '_timestamp');
      } else if (cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < cacheTime) {
        console.log('Använder cachad data');
        newsContainer.innerHTML = '';
        newsItems.forEach(item => {
          const newsItem = createNewsItem(item);
          newsContainer.appendChild(newsItem);
        });
        return;
      }
    }

    if (window.location.pathname.includes('sverige.html')) {
      rssUrls = RSS_SOURCES.sverige;
    } else if (window.location.pathname.includes('varlden.html') || 
               window.location.pathname.includes('utrikes.html')) {
      rssUrls = RSS_SOURCES.utrikes;
    } else {
      // Startsidan: blanda från alla källor, men sortera konsistent
      rssUrls = [...RSS_SOURCES.sverige, ...RSS_SOURCES.utrikes];
    }

    const allItems = [];
    
    // Hämta från alla källor parallellt
    const promises = rssUrls.map(url => fetchRss(url));
    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.items) {
        console.log(`Hämtade ${result.value.items.length} artiklar från ${rssUrls[index]}`);
        allItems.push(...result.value.items);
      } else {
        console.warn(`Misslyckades att hämta från ${rssUrls[index]}`);
      }
    });

    console.log(`Totalt hämtade: ${allItems.length} artiklar`);

    if (allItems.length === 0) {
      newsContainer.innerHTML = '<p>Det gick inte att hämta några nyheter just nu.</p>';
      return;
    }

    // Ta bort dubbletter och filtrera bort SVT
    const filteredItems = allItems.filter(item => 
      !item.link.toLowerCase().includes('svt.se')
    );
    
    const uniqueItems = filteredItems.filter((item, index, self) =>
      index === self.findIndex(i => i.title === item.title)
    );

    console.log(`Efter dubblettborttagning: ${uniqueItems.length} artiklar`);

    // Sortera efter datum för konsistent ordning
    const finalItems = sortAndLimit(uniqueItems, 40, 50);
    
    // Cacha resultatet
    localStorage.setItem(cacheKey, JSON.stringify(finalItems));
    localStorage.setItem(cacheKey + '_timestamp', Date.now().toString());

    // Rensa laddning och visa nyheter
    newsContainer.innerHTML = '';
    
    finalItems.forEach(item => {
      const newsItem = createNewsItem(item);
      newsContainer.appendChild(newsItem);
    });

    console.log(`Visar ${finalItems.length} artiklar`);

  } catch (error) {
    newsContainer.innerHTML = '<p>Det gick inte att hämta nyheterna just nu.</p>';
    console.error('Fel vid hämtning av nyheter:', error);
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.header-links a');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      // Rensa cache när användaren navigerar
      Object.keys(localStorage).forEach(key => {
        if (key.endsWith('.html') || key.endsWith('.html_timestamp')) {
          localStorage.removeItem(key);
        }
      });
      
      // Spara aktiv länk
      localStorage.setItem('activeLinkHref', link.getAttribute('href'));
      
      // Låt länken fungera normalt - ta inte bort default beteende
    });
  });

  // Sätt aktiv klass baserat på aktuell sida
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPage || 
        (currentPage === 'index.html' && linkHref === 'index.html') ||
        (currentPage === '' && linkHref === 'index.html')) {
      link.classList.add('active');
    }
  });
});






























// RSS-flöden från polisen.se för alla län
const RSS_FEEDS = {
    nyheter: {
        'Blekinge': 'https://polisen.se/aktuellt/rss/blekinge/nyheter-rss---blekinge/',
        'Dalarna': 'https://polisen.se/aktuellt/rss/dalarna/nyheter-rss---dalarna/',
        'Gotland': 'https://polisen.se/aktuellt/rss/gotland/nyheter-rss---gotland/',
        'Gävleborg': 'https://polisen.se/aktuellt/rss/gavleborg/nyheter-rss---gavleborg/',
        'Halland': 'https://polisen.se/aktuellt/rss/halland/nyheter-rss---halland/',
        'Jämtland': 'https://polisen.se/aktuellt/rss/jamtland/nyheter-rss---jamtland/',
        'Jönköpings län': 'https://polisen.se/aktuellt/rss/jonkoping/nyheter-rss---jonkoping/',
        'Kalmar län': 'https://polisen.se/aktuellt/rss/kalmar-lan/nyheter-rss---kalmar-lan/',
        'Kronoberg': 'https://polisen.se/aktuellt/rss/kronoberg/nyheter-rss---kronoberg/',
        'Norrbotten': 'https://polisen.se/aktuellt/rss/norrbotten/nyheter-rss---norrbotten/',
        'Skåne': 'https://polisen.se/aktuellt/rss/skane/nyheter-rss---skane/',
        'Stockholms län': 'https://polisen.se/aktuellt/rss/stockholms-lan/nyheter-rss---stockholms-lan/',
        'Södermanland': 'https://polisen.se/aktuellt/rss/sodermanland/nyheter-rss---sodermanland/',
        'Uppsala län': 'https://polisen.se/aktuellt/rss/uppsala-lan/nyheter-rss---uppsala-lan/',
        'Värmland': 'https://polisen.se/aktuellt/rss/varmland/nyheter-rss---varmland/',
        'Västerbotten': 'https://polisen.se/aktuellt/rss/vasterbotten/nyheter-rss---vasterbotten/',
        'Västernorrland': 'https://polisen.se/aktuellt/rss/vasternorrland/nyheter-rss---vasternorrland/',
        'Västmanland': 'https://polisen.se/aktuellt/rss/vastmanland/nyheter-rss---vastmanland/',
        'Västra Götaland': 'https://polisen.se/aktuellt/rss/vastra-gotaland/nyheter-rss---vastra-gotaland/',
        'Örebro län': 'https://polisen.se/aktuellt/rss/orebro-lan/nyheter-rss---orebro-lan/',
        'Östergötland': 'https://polisen.se/aktuellt/rss/ostergotland/nyheter-rss---ostergotland/'
    },
    handelser: {
        'Blekinge': 'https://polisen.se/aktuellt/rss/blekinge/handelser-rss---blekinge/',
        'Dalarna': 'https://polisen.se/aktuellt/rss/dalarna/handelser-rss---dalarna/',
        'Gotland': 'https://polisen.se/aktuellt/rss/gotland/handelser-rss---gotland/',
        'Gävleborg': 'https://polisen.se/aktuellt/rss/gavleborg/handelser-rss---gavleborg/',
        'Halland': 'https://polisen.se/aktuellt/rss/halland/handelser-rss---halland/',
        'Jämtland': 'https://polisen.se/aktuellt/rss/jamtland/handelser-rss---jamtland/',
        'Jönköpings län': 'https://polisen.se/aktuellt/rss/jonkoping/handelser-rss---jonkoping/',
        'Kalmar län': 'https://polisen.se/aktuellt/rss/kalmar-lan/handelser-rss---kalmar-lan/',
        'Kronoberg': 'https://polisen.se/aktuellt/rss/kronoberg/handelser-rss---kronoberg/',
        'Norrbotten': 'https://polisen.se/aktuellt/rss/norrbotten/handelser-rss---norrbotten/',
        'Skåne': 'https://polisen.se/aktuellt/rss/skane/handelser-rss---skane/',
        'Stockholms län': 'https://polisen.se/aktuellt/rss/stockholm-lan/handelser-rss---stockholm-lan/',
        'Södermanland': 'https://polisen.se/aktuellt/rss/sodermanland/handelser-rss---sodermanland/',
        'Uppsala län': 'https://polisen.se/aktuellt/rss/uppsala-lan/handelser-rss---uppsala-lan/',
        'Värmland': 'https://polisen.se/aktuellt/rss/varmland/handelser-rss---varmland/',
        'Västerbotten': 'https://polisen.se/aktuellt/rss/vasterbotten/handelser-rss---vasterbotten/',
        'Västernorrland': 'https://polisen.se/aktuellt/rss/vasternorrland/handelser-rss---vasternorrland/',
        'Västmanland': 'https://polisen.se/aktuellt/rss/vastmanland/handelser-rss---vastmanland/',
        'Västra Götaland': 'https://polisen.se/aktuellt/rss/vastra-gotaland/handelser-rss---vastra-gotaland/',
        'Örebro län': 'https://polisen.se/aktuellt/rss/orebro-lan/handelser-rss---orebro-lan/',
        'Östergötland': 'https://polisen.se/aktuellt/rss/ostergotland/handelser-rss---ostergotland/'
    },
    // Lokala tidningar för Södermanland och Östergötland
    ekuriren: 'https://www.ekuriren.se/rss/lokalt',
    strengnastidning: 'https://www.strengnastidning.se/rss/lokalt',
    nt: 'https://www.nt.se/rss/lokalt'
  };
  
  // Flera CORS proxies att testa
  const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://api.codetabs.com/v1/proxy?quest='
  ];
  
  let currentProxyIndex = 0;
  let allArticles = [];
  let displayedArticles = 0;
  const ARTICLES_PER_PAGE = 20;
  let isLoading = false;
  let hasMoreArticles = true;
  let selectedLän = null;
  let currentDropdown = null;
  
  // Dropdown-funktionalitet
  function createLänDropdown() {
      const allLän = Object.keys(RSS_FEEDS.nyheter).sort();
      
      const länGroups = {
          'Norra Sverige': ['Norrbotten', 'Västerbotten', 'Jämtland', 'Västernorrland', 'Gävleborg'],
          'Mellansverige': ['Dalarna', 'Värmland', 'Västmanland', 'Uppsala län', 'Stockholms län', 'Södermanland', 'Örebro län'],
          'Götaland': ['Västra Götaland', 'Östergötland', 'Jönköpings län', 'Kronoberg', 'Kalmar län', 'Halland', 'Skåne', 'Blekinge'],
          'Övrigt': ['Gotland']
      };
  
      console.log('Skapar dropdown med längrupper:', länGroups); // Debug
  
      const dropdownHTML = `
          <div class="dropdown-container">
              <a href="#" class="dropdown-toggle" id="länDropdownToggle">
                  <span class="dropdown-text">${selectedLän ? selectedLän : 'Lokala händelser'}</span>
              </a>
              <div class="dropdown-menu" id="länDropdownMenu">
                  <div class="dropdown-header">Välj län</div>
                  
                  <div class="dropdown-search">
                      <input type="text" id="länSearch" placeholder="Sök län..." />
                  </div>
                  
                  <div class="dropdown-section">
                      <button class="dropdown-item ${!selectedLän ? 'selected' : ''}" data-län="alla">
                          Alla län
                      </button>
                  </div>
                  
                  ${Object.entries(länGroups).map(([groupName, länList]) => `
                      <div class="dropdown-section">
                          <div class="dropdown-section-title">${groupName}</div>
                          ${länList.map(län => `
                              <button class="dropdown-item ${selectedLän === län ? 'selected' : ''}" data-län="${län}">
                                  ${län}
                              </button>
                          `).join('')}
                      </div>
                  `).join('')}
              </div>
          </div>
          <div class="dropdown-overlay" id="dropdownOverlay"></div>
      `;
  
      console.log('Dropdown HTML skapad'); // Debug
      return dropdownHTML;
  }
  
  function setupDropdownEvents() {
      const toggle = document.getElementById('länDropdownToggle');
      const menu = document.getElementById('länDropdownMenu');
      const overlay = document.getElementById('dropdownOverlay');
      const searchInput = document.getElementById('länSearch');
  
      console.log('setupDropdownEvents körs...', { toggle, menu }); // Debug
  
      if (!toggle || !menu) {
          console.error('Toggle eller menu hittades inte!');
          return;
      }
  
      toggle.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('Toggle klickad');
          toggleDropdown();
      });
  
      if (overlay) {
          overlay.addEventListener('click', closeDropdown);
      }
  
      document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && menu.classList.contains('open')) {
              closeDropdown();
          }
      });
  
      if (searchInput) {
          searchInput.addEventListener('input', (e) => {
              filterDropdownItems(e.target.value);
          });
      }
  
      // Länk-val händelser
      const dropdownItems = menu.querySelectorAll('.dropdown-item');
      console.log(`Hittade ${dropdownItems.length} dropdown items`); // Debug
      
      dropdownItems.forEach((item, index) => {
          const län = item.getAttribute('data-län');
          console.log(`Sätter upp event för item ${index}: ${län}`); // Debug
          
          item.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log(`Dropdown item klickad: ${län}`); // Debug
              
              // Stäng dropdown först
              closeDropdown();
              
              // Direkt navigation utan delay - låt browsern hantera allt
              const targetUrl = län === 'alla' ? 'lokalt.html' : `lokalt.html?län=${encodeURIComponent(län)}`;
              console.log(`Direkt navigation till: ${targetUrl}`);
              
              // Använd den mest basic metoden
              document.location = targetUrl;
          });
      });
  }
  
  function toggleDropdown() {
      const menu = document.getElementById('länDropdownMenu');
      if (!menu) return;
  
      const isOpen = menu.classList.contains('open');
      if (isOpen) {
          closeDropdown();
      } else {
          openDropdown();
      }
  }
  
  function openDropdown() {
      const toggle = document.getElementById('länDropdownToggle');
      const menu = document.getElementById('länDropdownMenu');
      const overlay = document.getElementById('dropdownOverlay');
  
      if (!menu || !toggle || !overlay) return;
  
      menu.classList.add('open');
      toggle.classList.add('open', 'active');
      overlay.classList.add('active');
      currentDropdown = menu;
  
      const searchInput = document.getElementById('länSearch');
      if (searchInput) {
          setTimeout(() => searchInput.focus(), 100);
      }
  }
  
  function closeDropdown() {
      const toggle = document.getElementById('länDropdownToggle');
      const menu = document.getElementById('länDropdownMenu');
      const overlay = document.getElementById('dropdownOverlay');
  
      if (!menu || !toggle || !overlay) return;
  
      menu.classList.remove('open');
      toggle.classList.remove('open');
      overlay.classList.remove('active');
      
      // Behåll 'active' klass om vi är på lokalt.html
      if (window.location.pathname.includes('lokalt.html')) {
          toggle.classList.add('active');
      }
  
      currentDropdown = null;
  
      const searchInput = document.getElementById('länSearch');
      if (searchInput) {
          searchInput.value = '';
          filterDropdownItems('');
      }
  }
  
  function filterDropdownItems(searchTerm) {
      const items = document.querySelectorAll('.dropdown-item:not([data-län="alla"])');
      const searchLower = searchTerm.toLowerCase();
  
      items.forEach(item => {
          const länName = item.textContent.toLowerCase();
          if (länName.includes(searchLower)) {
              item.style.display = 'block';
          } else {
              item.style.display = 'none';
          }
      });
  
      const sections = document.querySelectorAll('.dropdown-section');
      sections.forEach(section => {
          const sectionTitle = section.querySelector('.dropdown-section-title');
          if (!sectionTitle) return;
  
          const visibleItems = section.querySelectorAll('.dropdown-item[style*="block"], .dropdown-item:not([style])');
          if (visibleItems.length === 0) {
              section.style.display = 'none';
          } else {
              section.style.display = 'block';
          }
      });
  }
  
  function selectLän(län) {
      console.log(`selectLän anropad med: ${län}`); // Debug
      
      const toggle = document.getElementById('länDropdownToggle');
      const toggleText = toggle?.querySelector('.dropdown-text');
      
      // Uppdatera dropdown-texten
      if (län === 'alla') {
          if (toggleText) toggleText.textContent = 'Lokala händelser';
      } else {
          if (toggleText) toggleText.textContent = län;
      }
  
      // Uppdatera selected state i dropdown
      document.querySelectorAll('.dropdown-item').forEach(item => {
          item.classList.remove('selected');
      });
      
      const selectedItem = document.querySelector(`[data-län="${län === null || län === 'alla' ? 'alla' : län}"]`);
      if (selectedItem) {
          selectedItem.classList.add('selected');
      }
  
      closeDropdown();
  
      // Navigera ALLTID till lokalt.html med rätt parameter
      console.log('Navigerar till lokalt.html...'); // Debug
      const targetUrl = län === 'alla' ? 'lokalt.html' : `lokalt.html?län=${encodeURIComponent(län)}`;
      console.log(`Direkt navigation till: ${targetUrl}`);
      
      // Använd den mest basic metoden
      document.location = targetUrl;
  }
  
  function resetAndLoadNews() {
      allArticles = [];
      displayedArticles = 0;
      hasMoreArticles = true;
      isLoading = false;
  
      const container = document.getElementById('news-container');
      if (container) {
          container.innerHTML = '';
      }
  
      fetchLocalNews();
  }
  
  // Funktion för att parsa RSS XML
  function parseRSSXML(xmlString) {
      console.log('Parsar RSS XML...', xmlString.substring(0, 200));
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
          console.error('XML Parse Error:', parseError.textContent);
          return [];
      }
      
      const items = xmlDoc.querySelectorAll('item');
      console.log(`Hittade ${items.length} items i RSS`);
      
      const articles = [];
      
      items.forEach((item, index) => {
          const title = item.querySelector('title')?.textContent;
          const description = item.querySelector('description')?.textContent;
          const link = item.querySelector('link')?.textContent;
          const pubDate = item.querySelector('pubDate')?.textContent;
          const category = item.querySelector('category')?.textContent || 'Okategoriserad';
          
          if (title && link) {
              articles.push({
                  title: title.trim(),
                  description: description?.trim() || 'Ingen beskrivning tillgänglig.',
                  url: link.trim(),
                  publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
                  source: { name: 'Polisen' },
                  category: category,
                  urlToImage: null
              });
          }
      });
      
      console.log(`Skapade ${articles.length} artiklar`);
      return articles;
  }
  
  // Funktion för att hämta RSS-feed med flera proxies
  async function fetchRSSFeed(url) {
      console.log(`Försöker hämta RSS från: ${url}`);
      
      for (let i = 0; i < CORS_PROXIES.length; i++) {
          const proxyIndex = (currentProxyIndex + i) % CORS_PROXIES.length;
          const proxy = CORS_PROXIES[proxyIndex];
          
          try {
              console.log(`Testar proxy ${proxyIndex}: ${proxy}`);
              
              const proxyUrl = proxy + encodeURIComponent(url);
              const response = await fetch(proxyUrl, {
                  method: 'GET',
                  headers: {
                      'Accept': 'application/rss+xml, application/xml, text/xml',
                  }
              });
              
              if (!response.ok) {
                  console.warn(`Proxy ${proxyIndex} misslyckades med status:`, response.status);
                  continue;
              }
              
              const xmlString = await response.text();
              console.log(`Proxy ${proxyIndex} lyckades! XML längd:`, xmlString.length);
              
              if (xmlString && (xmlString.includes('<rss') || xmlString.includes('<item>'))) {
                  currentProxyIndex = proxyIndex;
                  return parseRSSXML(xmlString);
              } else {
                  console.warn(`Proxy ${proxyIndex} returnerade inte giltig RSS`);
              }
              
          } catch (error) {
              console.warn(`Proxy ${proxyIndex} kastade fel:`, error);
              continue;
          }
      }
      
      console.error(`Alla proxies misslyckades för URL: ${url}`);
      return [];
  }
  
  // Funktion för att hämta lokala nyheter
  async function fetchLocalNews() {
      if (isLoading) return;
      isLoading = true;
      
      const container = document.getElementById('news-container');
      
      if (allArticles.length === 0) {
          const länText = selectedLän ? `från ${selectedLän}` : 'från alla län';
          container.innerHTML = `
              <div class="loading">
                  <div class="loading-spinner"></div>
                  <p>Hämtar lokala nyheter ${länText}...</p>
                  <p style="color: #888; font-size: 0.8rem;">Detta kan ta några sekunder...</p>
              </div>
          `;
      }
  
      try {
          console.log(`Börjar hämta lokala nyheter för: ${selectedLän || 'alla län'}`);
          
          if (allArticles.length === 0) {
              const tempArticles = [];
              
              const länToFetch = selectedLän ? [selectedLän] : Object.keys(RSS_FEEDS.nyheter);
              
              console.log(`Hämtar från ${länToFetch.length} län: ${länToFetch.join(', ')}`);
              
              const BATCH_SIZE = selectedLän ? 1 : 5;
              const batches = [];
              for (let i = 0; i < länToFetch.length; i += BATCH_SIZE) {
                  batches.push(länToFetch.slice(i, i + BATCH_SIZE));
              }
              
              for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
                  const batch = batches[batchIndex];
                  console.log(`Bearbetar batch ${batchIndex + 1}/${batches.length} (${batch.join(', ')})`);
                  
                  const batchPromises = [];
                  
                  batch.forEach(län => {
                      // Polisens nyheter
                      const nyhetUrl = RSS_FEEDS.nyheter[län];
                      if (nyhetUrl) {
                          batchPromises.push(
                              fetchRSSFeed(nyhetUrl).then(articles => 
                                  articles.map(article => ({ ...article, län, typ: 'Nyhet', källa: 'Polisen' }))
                              ).catch(error => {
                                  console.warn(`Fel vid hämtning av nyheter från ${län}:`, error);
                                  return [];
                              })
                          );
                      }
                      
                      // Polisens händelser
                      const handelseUrl = RSS_FEEDS.handelser[län];
                      if (handelseUrl) {
                          batchPromises.push(
                              fetchRSSFeed(handelseUrl).then(articles => 
                                  articles.map(article => ({ ...article, län, typ: 'Händelse', källa: 'Polisen' }))
                              ).catch(error => {
                                  console.warn(`Fel vid hämtning av händelser från ${län}:`, error);
                                  return [];
                              })
                          );
                      }
                      
                      // Lägg till lokala tidningar bara för Södermanland och Östergötland
                      if (län === 'Södermanland') {
                          console.log('Lägger till lokala tidningar för Södermanland...');
                          
                          // Eskilstuna-Kuriren
                          batchPromises.push(
                              fetchRSSFeed(RSS_FEEDS.ekuriren).then(articles => {
                                  console.log(`Eskilstuna-Kuriren hämtade ${articles.length} artiklar`);
                                  return articles.map(article => ({ 
                                      ...article, 
                                      län, 
                                      typ: 'Lokal nyhet', 
                                      källa: 'Eskilstuna-Kuriren'
                                  }));
                              }).catch(error => {
                                  console.warn(`Fel vid hämtning från Eskilstuna-Kuriren:`, error);
                                  return [];
                              })
                          );
                          
                          // Strengnäs Tidning
                          batchPromises.push(
                              fetchRSSFeed(RSS_FEEDS.strengnastidning).then(articles => {
                                  console.log(`Strengnäs Tidning hämtade ${articles.length} artiklar`);
                                  return articles.map(article => ({ 
                                      ...article, 
                                      län, 
                                      typ: 'Lokal nyhet', 
                                      källa: 'Strengnäs Tidning'
                                  }));
                              }).catch(error => {
                                  console.warn(`Fel vid hämtning från Strengnäs Tidning:`, error);
                                  return [];
                              })
                          );
                      }
                      
                      // Lägg till Norrköpings Tidning för Östergötland
                      if (län === 'Östergötland') {
                          console.log('Lägger till Norrköpings Tidning för Östergötland...');
                          
                          batchPromises.push(
                              fetchRSSFeed(RSS_FEEDS.nt).then(articles => {
                                  console.log(`Norrköpings Tidning hämtade ${articles.length} artiklar`);
                                  return articles.map(article => ({ 
                                      ...article, 
                                      län, 
                                      typ: 'Lokal nyhet', 
                                      källa: 'Norrköpings Tidning'
                                  }));
                              }).catch(error => {
                                  console.warn(`Fel vid hämtning från Norrköpings Tidning:`, error);
                                  return [];
                              })
                          );
                      }
                  });
                  
                  const batchResults = await Promise.all(batchPromises);
                  batchResults.forEach(articles => {
                      if (articles.length > 0) {
                          console.log(`Lade till ${articles.length} artiklar från batch`);
                          tempArticles.push(...articles);
                      }
                  });
                  
                  if (batchIndex < batches.length - 1) {
                      await new Promise(resolve => setTimeout(resolve, selectedLän ? 200 : 500));
                  }
              }
              
              console.log(`Totalt ${tempArticles.length} artiklar hämtade`);
              
              tempArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
              
              allArticles = tempArticles;
          }
          
          displayNextBatch();
          
      } catch (error) {
          console.error('Fel vid hämtning av lokala nyheter:', error);
          const länText = selectedLän ? `för ${selectedLän}` : '';
          container.innerHTML = `
              <div class="loading">
                  <p>Kunde inte ladda lokala nyheter ${länText}. Försök igen senare.</p>
                  <p style="color: #888; font-size: 0.8rem;">Fel: ${error.message}</p>
                  <button onclick="resetAndLoadNews()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #63847a; color: white; border: none; border-radius: 4px; cursor: pointer;">
                      Försök igen
                  </button>
              </div>
          `;
      } finally {
          isLoading = false;
      }
  }
  
  function displayNextBatch() {
      const container = document.getElementById('news-container');
      
      if (!container) {
          console.error('news-container hittades inte!');
          return;
      }
      
      console.log(`displayNextBatch körs, container finns: ${!!container}`); // Debug
      
      const loadingElement = container.querySelector('.loading');
      if (loadingElement && displayedArticles === 0) {
          console.log('Tar bort loading element'); // Debug
          loadingElement.remove();
      }
      
      const startIndex = displayedArticles;
      const endIndex = Math.min(displayedArticles + ARTICLES_PER_PAGE, allArticles.length);
      
      if (startIndex >= allArticles.length) {
          hasMoreArticles = false;
          return;
      }
      
      const articlesToShow = allArticles.slice(startIndex, endIndex);
      
      console.log(`Visar artiklar ${startIndex + 1}-${endIndex} av ${allArticles.length}`);
      console.log(`Artiklar att visa:`, articlesToShow.length); // Debug
      
      let addedCount = 0; // Debug räknare
      
      articlesToShow.forEach((article, index) => {
          if (article.title && article.title !== '[Removed]') {
              const newsItem = createLocalNewsItem(article, startIndex + index);
              console.log(`Skapar newsItem för: ${article.title.substring(0, 50)}...`); // Debug
              container.appendChild(newsItem);
              addedCount++;
          }
      });
      
      console.log(`Lade till ${addedCount} artikelelement i DOM`); // Debug
      console.log(`Container har nu ${container.children.length} barn`); // Debug
      
      displayedArticles = endIndex;
      
      if (displayedArticles >= allArticles.length) {
          hasMoreArticles = false;
          const endMessage = document.createElement('div');
          endMessage.className = 'loading';
          const länText = selectedLän ? `från ${selectedLän}` : '';
          endMessage.innerHTML = `
              <p style="color: #888;">Du har nått slutet av alla lokala nyheter ${länText}.</p>
              <p style="color: #666; font-size: 0.8rem;">Totalt ${allArticles.length} artiklar visade</p>
          `;
          container.appendChild(endMessage);
      } else {
          addLoadMoreIndicator();
      }
  }
  
  function addLoadMoreIndicator() {
      const container = document.getElementById('news-container');
      
      const existingIndicator = container.querySelector('.load-more-indicator');
      if (existingIndicator) {
          existingIndicator.remove();
      }
      
      const loadMoreIndicator = document.createElement('div');
      loadMoreIndicator.className = 'loading load-more-indicator';
      loadMoreIndicator.innerHTML = `
          <div class="loading-spinner"></div>
          <p>Laddar fler nyheter...</p>
      `;
      
      container.appendChild(loadMoreIndicator);
  }
  
  function setupInfiniteScroll() {
      let isScrollLoading = false;
      
      window.addEventListener('scroll', () => {
          if (isScrollLoading || !hasMoreArticles || isLoading) return;
          
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const windowHeight = window.innerHeight;
          const docHeight = document.documentElement.scrollHeight;
          
          if (scrollTop + windowHeight >= docHeight - 200) {
              isScrollLoading = true;
              
              const indicator = document.querySelector('.load-more-indicator');
              if (indicator) {
                  indicator.remove();
              }
              
              setTimeout(() => {
                  displayNextBatch();
                  isScrollLoading = false;
              }, 500);
          }
      });
  }
  
  function createLocalNewsItem(article, index) {
      const newsItem = document.createElement('div');
      newsItem.className = 'news-item';
      newsItem.dataset.index = index;
      
      const publishedDate = new Date(article.publishedAt);
      const now = new Date();
      const timeDiff = now - publishedDate;
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      const daysAgo = Math.floor(hoursAgo / 24);
      
      let timeAgoText;
      if (hoursAgo < 1) {
          timeAgoText = 'För mindre än 1 timme sedan';
      } else if (hoursAgo < 24) {
          timeAgoText = `För ${hoursAgo} timme${hoursAgo !== 1 ? 'r' : ''} sedan`;
      } else {
          timeAgoText = `För ${daysAgo} dag${daysAgo !== 1 ? 'ar' : ''} sedan`;
      }
      
      let sourceName;
      if (article.källa === 'Polisen') {
          sourceName = `Polisen ${article.län || ''}`;
      } else if (article.källa === 'Eskilstuna-Kuriren') {
          sourceName = 'Eskilstuna-Kuriren';
      } else if (article.källa === 'Strengnäs Tidning') {
          sourceName = 'Strengnäs Tidning';
      } else if (article.källa === 'Norrköpings Tidning') {
          sourceName = 'Norrköpings Tidning';
      } else {
          sourceName = article.källa || 'Okänd källa';
      }
      
      const sourceType = article.typ || 'Okänd';
      const description = article.description || 'Ingen beskrivning tillgänglig.';
      const shortDescription = description.length > 200 ?
          description.substring(0, 200) + '...' : description;
      
      newsItem.innerHTML = `
          <div class="news-source">${sourceName} • ${sourceType}</div>
          <div class="news-title">${article.title}</div>
          <div class="news-content">${shortDescription}</div>
          <small>${timeAgoText}</small>
      `;
      
      newsItem.addEventListener('click', () => openLocalModal(article, sourceName, timeAgoText, publishedDate, sourceType));
      return newsItem;
  }
  
  function openLocalModal(article, sourceName, timeAgo, publishedDate, sourceType) {
      const modal = document.createElement('div');
      modal.className = 'modal';
      
      const description = article.description || 'Ingen beskrivning tillgänglig.';
      const content = article.content || description;
      const cleanContent = content.replace(/\[\+\d+\s+chars\]$/, '');
      
      let websiteName;
      if (article.källa === 'Polisen') {
          websiteName = 'polisen.se';
      } else if (article.källa === 'Eskilstuna-Kuriren') {
          websiteName = 'ekuriren.se';
      } else if (article.källa === 'Strengnäs Tidning') {
          websiteName = 'strengnastidning.se';
      } else if (article.källa === 'Norrköpings Tidning') {
          websiteName = 'nt.se';
      } else {
          websiteName = 'Lokal tidning';
      }
      
      let readMoreText;
      if (article.källa === 'Polisen') {
          readMoreText = 'Läs mer på Polisen.se';
      } else if (article.källa === 'Eskilstuna-Kuriren') {
          readMoreText = 'Läs mer på Ekuriren.se';
      } else if (article.källa === 'Strengnäs Tidning') {
          readMoreText = 'Läs mer på Strengnäs Tidning';
      } else if (article.källa === 'Norrköpings Tidning') {
          readMoreText = 'Läs mer på NT.se';
      } else {
          readMoreText = 'Läs mer';
      }
      
      modal.innerHTML = `
          <div class="modal-content">
              <button class="close-modal">&times;</button>
              
              <div class="modal-source-header">
                  <div class="source-info">
                      <div class="source-name">${sourceName}</div>
                      <div class="source-details">
                          <span class="source-type">${sourceType}</span>
                          <span class="source-divider">•</span>
                          <span class="source-website">${websiteName}</span>
                      </div>
                      ${article.län ? `<div class="source-description">Från ${article.län}</div>` : ''}
                  </div>
              </div>
              
              <div class="article-meta">
                  <div class="publish-info">
                      <div class="publish-date">${publishedDate.toLocaleDateString('sv-SE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                      })}</div>
                      <div class="time-ago">${timeAgo}</div>
                  </div>
              </div>
              
              <h2 class="modal-title">${article.title}</h2>
              <div class="modal-text">${cleanContent}</div>
              
              <div class="modal-footer">
              <div class="modal-footer">
                  <div class="footer-source-info">
                      <small>Källa: ${sourceName}</small>
                  </div>
                  <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="read-more-btn">
                      ${readMoreText}
                  </a>
              </div>
          </div>
      `;
      
      const closeBtn = modal.querySelector('.close-modal');
      closeBtn.addEventListener('click', () => {
          document.body.removeChild(modal);
          document.body.classList.remove('modal-open');
      });
      
      modal.addEventListener('click', (e) => {
          if (e.target === modal) {
              document.body.removeChild(modal);
              document.body.classList.remove('modal-open');
          }
      });
      
      document.body.appendChild(modal);
      document.body.classList.add('modal-open');
  }
  
  async function testLokalaTidningar() {
      console.log('Testar alla lokala tidningar...');
      
      const lokalaTidningar = [
          { name: 'Eskilstuna-Kuriren', url: RSS_FEEDS.ekuriren },
          { name: 'Strengnäs Tidning', url: RSS_FEEDS.strengnastidning },
          { name: 'Norrköpings Tidning', url: RSS_FEEDS.nt }
      ];
      
      for (const tidning of lokalaTidningar) {
          try {
              console.log(`Testar ${tidning.name} (${tidning.url})...`);
              const articles = await fetchRSSFeed(tidning.url);
              console.log(`${tidning.name}: ${articles.length} artiklar`);
              
              if (articles.length > 0) {
                  console.log(`Första artikeln från ${tidning.name}:`, articles[0]);
              }
          } catch (error) {
              console.error(`Fel för ${tidning.name}:`, error);
          }
      }
  }
  
  async function testStrengnasTidning() {
      console.log('Testar specifikt Strengnäs Tidning RSS...');
      
      const testUrl = 'https://www.strengnastidning.se/rss/lokalt';
      
      try {
          console.log(`Försöker hämta från: ${testUrl}`);
          const articles = await fetchRSSFeed(testUrl);
          console.log(`Strengnäs Tidning resultat: ${articles.length} artiklar`);
          
          if (articles.length > 0) {
              console.log('Första artikeln:', articles[0]);
              alert(`Strengnäs Tidning: Hittade ${articles.length} artiklar!\nFörsta: ${articles[0].title}`);
          } else {
              console.warn('Inga artiklar hittades från Strengnäs Tidning');
              alert('Strengnäs Tidning: Inga artiklar hittades. Kontrollera console för detaljer.');
          }
      } catch (error) {
          console.error('Fel vid test av Strengnäs Tidning:', error);
          alert(`Strengnäs Tidning fel: ${error.message}`);
      }
  }
  
  async function testSingleRSS() {
      console.log('Testar lokala RSS-flöden...');
      
      const testFeeds = [
          {
              name: 'Polisen Södermanland',
              url: 'https://polisen.se/aktuellt/rss/sodermanland/nyheter-rss---sodermanland/',
              type: 'Nyhet'
          },
          {
              name: 'Eskilstuna-Kuriren',
              url: 'https://www.ekuriren.se/rss/lokalt',
              type: 'Lokal nyhet'
          },
          {
              name: 'Norrköpings Tidning',
              url: 'https://www.nt.se/rss/lokalt',
              type: 'Lokal nyhet'
          }
      ];
      
      try {
          const container = document.getElementById('news-container');
          container.innerHTML = `
              <div class="loading">
                  <div class="loading-spinner"></div>
                  <p>Testar RSS-flöden för Södermanland...</p>
              </div>
          `;
          
          let totalArticles = 0;
          const results = [];
          
          for (const feed of testFeeds) {
              console.log(`Testar ${feed.name}...`);
              try {
                  const articles = await fetchRSSFeed(feed.url);
                  console.log(`${feed.name}: ${articles.length} artiklar`);
                  totalArticles += articles.length;
                  results.push(`${feed.name}: ${articles.length} artiklar`);
              } catch (error) {
                  console.warn(`Fel för ${feed.name}:`, error);
                  results.push(`${feed.name}: Misslyckades (${error.message})`);
              }
          }
          
          if (totalArticles > 0) {
              container.innerHTML = `
                  <div class="loading">
                      <p style="color: #63847a;">Test lyckades!</p>
                      <div style="color: #888; font-size: 0.9rem; margin: 1rem 0;">
                          ${results.map(result => `<p>• ${result}</p>`).join('')}
                      </div>
                      <button onclick="selectLän('Södermanland')" style="margin: 0.5rem; padding: 0.5rem 1rem; background: #63847a; color: white; border: none; border-radius: 4px; cursor: pointer;">
                          Ladda Södermanlands nyheter
                      </button>
                      <button onclick="testStrengnasTidning()" style="margin: 0.5rem; padding: 0.5rem 1rem; background: #555; color: white; border: none; border-radius: 4px; cursor: pointer;">
                          Testa bara Strengnäs Tidning
                      </button>
                      <button onclick="fetchLocalNews()" style="margin: 0.5rem; padding: 0.5rem 1rem; background: #63847a; color: white; border: none; border-radius: 4px; cursor: pointer;">
                          Ladda alla län
                      </button>
                  </div>
              `;
          } else {
              container.innerHTML = `
                  <div class="loading">
                      <p>Test misslyckades - inga artiklar hittades.</p>
                      <div style="color: #888; font-size: 0.9rem; margin: 1rem 0;">
                          ${results.map(result => `<p>• ${result}</p>`).join('')}
                      </div>
                      <p style="color: #888; font-size: 0.8rem;">Kontrollera console för detaljer.</p>
                  </div>
              `;
          }
      } catch (error) {
          console.error('Test fel:', error);
          document.getElementById('news-container').innerHTML = `
              <div class="loading">
                  <p>Test misslyckades med fel: ${error.message}</p>
              </div>
          `;
      }
  }
  
  function replaceLokalLinkWithDropdown() {
      const headerLinks = document.querySelector('.header-links');
      if (!headerLinks) {
          console.warn('header-links element hittades inte');
          return;
      }
      
      // Kolla om dropdown redan finns
      const existingDropdown = headerLinks.querySelector('.dropdown-container');
      if (existingDropdown) {
          console.log('Dropdown finns redan, hoppar över ersättning');
          setupDropdownEvents(); // Se till att events är uppsatta
          return;
      }
      
      const lokalLink = Array.from(headerLinks.querySelectorAll('a')).find(link => 
          link.textContent.trim() === 'Lokalt' || 
          link.textContent.trim() === 'Lokala händelser' || 
          link.href.includes('lokalt.html')
      );
      
      if (lokalLink) {
          console.log('Ersätter Lokalt-länk med dropdown...');
          const dropdownHTML = createLänDropdown();
          lokalLink.outerHTML = dropdownHTML;
          setupDropdownEvents();
          console.log('Lokala händelser-länk ersatt med dropdown');
      } else {
          console.warn('Kunde inte hitta Lokala händelser-länk att ersätta');
          
          // Om ingen länk hittades, lägg till dropdown i slutet
          console.log('Lägger till dropdown i slutet av header-links...');
          const dropdownHTML = createLänDropdown();
          headerLinks.insertAdjacentHTML('beforeend', dropdownHTML);
          setupDropdownEvents();
      }
  }
  
  // Funktion för att läsa URL-parametrar
  function getSelectedLänFromURL() {
      const urlParams = new URLSearchParams(window.location.search);
      const länFromURL = urlParams.get('län');
      
      if (länFromURL && Object.keys(RSS_FEEDS.nyheter).includes(länFromURL)) {
          return länFromURL;
      }
      return null;
  }
  
  // Funktion för att sätta valt län från URL
  function setSelectedLänFromURL() {
      const länFromURL = getSelectedLänFromURL();
      
      if (länFromURL) {
          selectedLän = länFromURL;
          
          // Uppdatera dropdown-knappen om den finns
          const toggle = document.getElementById('länDropdownToggle');
          const toggleText = toggle?.querySelector('.dropdown-text');
          if (toggleText) {
              toggleText.textContent = länFromURL;
          }
          
          console.log(`Län från URL: ${länFromURL}`);
      } else {
          // Om vi inte är på lokalt.html, återställ selectedLän
          if (!window.location.pathname.includes('lokalt.html')) {
              selectedLän = null;
              const toggle = document.getElementById('länDropdownToggle');
              const toggleText = toggle?.querySelector('.dropdown-text');
              if (toggleText) {
                  toggleText.textContent = 'Lokala händelser';
              }
          }
      }
  }
  
  // Starta allt när sidan laddas
  document.addEventListener('DOMContentLoaded', function() {
      console.log(`Sida laddad: ${window.location.pathname}`); // Debug
      
      // Vänta lite så DOM är helt klar
      setTimeout(() => {
          replaceLokalLinkWithDropdown();
          
          // Kontrollera om vi är på lokalt.html
          if (window.location.pathname.includes('lokalt.html')) {
              console.log('Vi är på lokalt.html, sätter upp lokala funktioner...');
              
              // Sätt valt län från URL-parameter om det finns
              setSelectedLänFromURL();
              
              // Markera dropdown som aktiv eftersom vi är på lokalt.html
              const toggle = document.getElementById('länDropdownToggle');
              if (toggle) {
                  toggle.classList.add('active');
                  console.log('Markerade dropdown som aktiv');
              }
              
              // Ladda nyheter
              fetchLocalNews();
              setupInfiniteScroll();
          } else {
              console.log('Vi är INTE på lokalt.html, hoppar över lokal setup');
              
              // Ta bort aktiv klass från dropdown om vi inte är på lokalt
              const toggle = document.getElementById('länDropdownToggle');
              if (toggle) {
                  toggle.classList.remove('active');
              }
              
              // Kontrollera om det finns ett news-container på denna sida
              const container = document.getElementById('news-container');
              if (!container) {
                  console.log('Ingen news-container hittades på denna sida');
              }
          }
      }, 50); // 50ms delay för att säkerställa DOM är klar
  });
  
  // Exportera funktioner för global åtkomst
  window.selectLän = selectLän;
  window.resetAndLoadNews = resetAndLoadNews;
  window.testSingleRSS = testSingleRSS;
  window.testStrengnasTidning = testStrengnasTidning;
  window.testLokalaTidningar = testLokalaTidningar;