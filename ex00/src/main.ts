
//Defining the UnsplashResults so TS will not warm of type 'any' (strict)
interface	UnsplashResult
{
	urls: {
		small: string;
	};
	links: {
		html: string;
	};
	id: string;
}
//Saving the HTML elements into JS variables
const	searchForm = document.querySelector("#search-form");
const	searchBox = document.querySelector("#search-box");
const	searchResults = document.querySelector("#search-results");
const	showMore = document.querySelector("#show-more");

let		keyword = "";
let		page = 1;
let		apiClient = "";
fetch('server-config.json')
	.then(response => response.json())
	.then(config => {
		apiClient = config.clientId;
	})
	.catch(error => console.error('Error loading config:', error));

//SearchForm listener (click/enter = submit)
if (searchForm)
{
	searchForm.addEventListener("submit", (e) => {
	//Avoid page to reload by itself (I don't fully understand this T_T)
	e.preventDefault();
	page = 1;
	searchImages();
})
}

async function	searchImages()
{
	if (searchBox)
	{
		const	inputElement = searchBox as HTMLInputElement;
		keyword = inputElement.value;
	}
	//Compose the URL according to API documentation
	const	url = `https://api.unsplash.com/search/photos?page=${page}&query=${keyword}&client_id=${apiClient}`;
	//Fetch-response
	const	response = await fetch(url);
	const	data = await response.json();
	//If first time search, clean the container
	if (page === 1 && searchResults)
		searchResults.innerHTML = "";
	const	results: UnsplashResult[] = data.results;
	//For each reasult, create HTML elements inside search-result div
	//Element img, element link ('a'), element fav-button
	results.map((result: UnsplashResult) => {
		const	imageContainer = document.createElement("div");
		imageContainer.classList.add("image-container");
		const	image = document.createElement("img");
		image.src = result.urls.small;
		const	imageLink = document.createElement("a");
		imageLink.href = result.links.html;
		imageLink.target = "_blank";
		imageLink.appendChild(image);//Append the image to the link
		const	favButton = document.createElement("button");
		favButton.textContent = "Favorite";
		favButton.classList.add("fav-button");
		favButton.addEventListener('click', () => saveFavorite(result.id));
		imageContainer.appendChild(imageLink);//Append the link (with image) to the container
		imageContainer.appendChild(favButton);//Append the favorite button to the container
		//add element to the container
		if (searchResults)
			searchResults.appendChild(imageContainer);
	});
	if (showMore)
	{
		const	inputElement = showMore as HTMLInputElement;
		inputElement.style.display = "block";
	}
}

//Showmore button listener
if (showMore)
{
	showMore.addEventListener("click", () => {
	page++;
	searchImages();
})
}
