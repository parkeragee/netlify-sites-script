import fs from 'fs';
import fetch from 'node-fetch';
import open from 'open';

const NETLIFY_API_URL = 'https://api.netlify.com/api/v1';
const NETLIFY_AUTH_TOKEN = process.env.TOKEN;
const PER_PAGE = 100;
const NETLIFY_REQUEST_HEADERS = { 'Authorization': `Bearer ${NETLIFY_AUTH_TOKEN}` };
const URL = `${NETLIFY_API_URL}/sites`;

const getSites = async (page) => {
    const response = await fetch(`${URL}?per_page=${PER_PAGE}&page=${page}`, {
        headers: NETLIFY_REQUEST_HEADERS
    });
    return response.json();
};

const generateSiteCardsHtml = (sites) => {
    return sites.map(site => `
    <div class="rounded border shadow-lg bg-white p-8">
      <img class="mb-3" src="${site.screenshot_url}" alt="${site.name}" />
      <a class="cursor-pointer text-blue-500" href="${site.url}" target="_blank">${site.url}</a>
    </div>
  `).join('');
};

const getTemplateHtml = (siteCardsHtml) => {
    const templateHtml = fs.readFileSync('./template.html', 'utf8');
    return templateHtml.replace('{{SITE_CARDS}}', siteCardsHtml);
};

const go = async () => {
    const siteData = [];
    for (let page = 1; ; page++) {
        const sites = await getSites(page);
        if (sites.length === 0) break;
        siteData.push(...sites);
    }
    const siteCardsHtml = generateSiteCardsHtml(siteData);
    const html = getTemplateHtml(siteCardsHtml);
    fs.writeFileSync('./index.html', html);
    open('./index.html');
};

go();
