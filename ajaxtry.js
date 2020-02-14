function http() {
    return{
        get(url,cb) {
            try {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.addEventListener('load', () => {
                if(Math.floor(xhr.status / 100) !== 2) {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                    return;
                }
                const response = JSON.parse(xhr.responseText);
                cb(null, response);
            });
        
            xhr.addEventListener('error', () => {
                cb(`Error. Status code: ${xhr.status}`, xhr);
                
            });
            xhr.send();
            
        } catch (error) {
            cb(error);
        }},
        post(url, body, headers, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", url);
                xhr.addEventListener('load', () => {
                    if(Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });
            
                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                    
                });

                if (headers) {
                    Object.entries(headers).forEach(([key, value]) => {
                        xhr.setRequestHeader(key,value);
                    })
                }
                xhr.send(JSON.stringify(body));
                
            } catch (error) {
                cb(error);
            }
        },
    }
}

const myHttp = http();
// myHttp.post('https://jsonplaceholder.typicode.com/posts' , {
//     title: 'foo',
//     body: 'bar',
//     userId: 1,
// }, {'Content-type' : 'application/json'},(err,resp) => {
//     console.log(err,resp)
// });
const newsService = (function () {
    const apiKey = 'a52d41af1dec485b99285c84db3df824';
    const apiUrl = 'https://newsapi.org/v2';

    return { 
        topHeadlines(country = 'ua' , cb) {
            myHttp.get(`${apiUrl}/top-headlines?country=${country}&apiKey=${apiKey}`,cb,); //dz with categories

        },
        everything(query, cb) {
            myHttp.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`,cb);

        }
    };

})();
// query = input то слоово которое будут вбивать 
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];

form.addEventListener('submit', (e) => {
    e.preventDefault();
    loadNews();
})

document.addEventListener('DOMContentLoaded', function() {
    M.AutoInit();
    loadNews();
})


function loadNews() {
    showLoader();
    const country = countrySelect.value;
    const searchText = searchInput.value;
   

    if(!searchText) {
        newsService.topHeadlines(country ,onGetResponse);
    }else {
        newsService.everything(searchText ,onGetResponse);
    }    
}

function onGetResponse(err, res) {
    removeLoader();
    if(err) {
        showAlert(err, 'msg-error');
        return;
    }    
    if(!res.articles.length) {
        // show empty msg dz
        return;
    }
    renderNews(res.articles);
}

function renderNews(news) {
    const container = document.querySelector('.news-container .row');
    if (container.children.length) {
        clearContainer(container);
    }
    let fragment = '';

    news.forEach((newsItem) =>{
        const el = newsTemplate(newsItem);
        fragment += el;
    });
    container.insertAdjacentHTML('afterbegin', fragment);
}
function clearContainer(container) {
    // container.innerHTML = ''; можна сделать и так чтобы очищать дом
    let child = container.lastElementChild;
    while(child) {
        container.removeChild(child);
        child = container.lastElementChild;
    }
}

function newsTemplate({urlToImage, title, url, description}) {
    
    return `<div class ="col s12">
    <div class="card">
    <div class = "card-image">
    <img src="${urlToImage}">
    <span class="card-title">${title || ''}</span>     
    </div>
    <div class="card-content">
    <p>${description || ''}</p>    
    </div>
    <div class="card-action">
    <a href="${url}">Read More</a>
    </div>
    </div>
    </div>`;

}

function showAlert(msg, type = 'success') {
    M.toast({html: msg, classes: type});

}
 
function showLoader() {
    document.body.insertAdjacentHTML('afterbegin', 
    `
    <div class="progress">
    <div class="indeterminate"></div>
    </div>
    `,);
}

function removeLoader() {
    const loader = document.querySelector('.progress');
    if(loader) {
        loader.remove();
    }
}