{
  "translatorID": "f045946a-4c6a-43ac-81b0-eaf52d892cbf",
  "label": "The Brain",
  "description": "exports references in a format that can be imported by The Brain",
  "creator": "Emiliano Heyns",
  "target": "txt",
  "minVersion": "4.0.27",
  "maxVersion": "",
  "configOptions": {
    "getCollections": true
  },
  "displayOptions": {
    "exportNotes": true
  },
  "translatorType": 2,
  "browserSupport": "gcsv",
  "priority": 99,
  "inRepository": false,
  "lastUpdated": "2019-01-16 20:50:45"
}

const aliases = Object.entries({
    bookTitle: 'publicationTitle',
    thesisType: 'type',
    university: 'publisher',
    letterType: 'type',
    manuscriptType: 'type',
    interviewMedium: 'medium',
    distributor: 'publisher',
    videoRecordingFormat: 'medium',
    genre: 'type',
    artworkMedium: 'medium',
    websiteType: 'type',
    websiteTitle: 'publicationTitle',
    institution: 'publisher',
    reportType: 'type',
    reportNumber: 'number',
    billNumber: 'number',
    codeVolume: 'volume',
    codePages: 'pages',
    dateDecided: 'date',
    reporterVolume: 'volume',
    firstPage: 'pages',
    caseName: 'title',
    docketNumber: 'number',
    documentNumber: 'number',
    patentNumber: 'number',
    issueDate: 'date',
    dateEnacted: 'date',
    publicLawNumber: 'number',
    nameOfAct: 'title',
    subject: 'title',
    mapType: 'type',
    blogTitle: 'publicationTitle',
    postType: 'type',
    forumTitle: 'publicationTitle',
    audioRecordingFormat: 'medium',
    label: 'publisher',
    presentationType: 'type',
    studio: 'publisher',
    network: 'publisher',
    episodeNumber: 'number',
    programTitle: 'publicationTitle',
    audioFileType: 'medium',
    company: 'publisher',
    proceedingsTitle: 'publicationTitle',
    encyclopediaTitle: 'publicationTitle',
    dictionaryTitle: 'publicationTitle',
});
function clean(txt) {
    return txt.replace(/\r/g, '').replace(/\n/g, ' ').replace(/;/g, ',').replace(/"/g, "'");
}
const ignore = new Set(['attachment', 'note']);
function detail(txt, prefix) {
    if (!txt)
        return;
    if (prefix !== '+')
        txt = clean(txt);
    if (prefix)
        prefix += ' ';
    Zotero.write(`\t${prefix}${txt}\n`);
}
function doExport() {
    let item;
    while (item = Zotero.nextItem()) {
        if (ignore.has(item.itemType))
            continue;
        for (const [alias, field] of aliases) {
            if (item[alias]) {
                item[field] = item[alias];
                delete item[alias];
            }
        }
        const reference = [];
        const creators = (item.creators || []).map(creator => {
            let name = '';
            if (creator.name)
                name = creator.name;
            if (creator.lastName)
                name = creator.lastName;
            if (creator.firstName)
                name += (name ? ', ' : '') + creator.firstName;
            return name;
        });
        switch (creators.length) {
            case 0:
                break;
            case 1:
                reference.push(creators[0]);
                break;
            default:
                reference.push(`${creators[0]} et al`);
                break;
        }
        const date = Zotero.Utilities.strToDate(item.date);
        const year = (date && typeof date.year !== 'undefined') ? date.year : '';
        if (year)
            reference.push(year);
        let title = item.title;
        if (reference.length)
            title += `, (${reference.join(', ')})`;
        Zotero.write(clean(title) + '\n');
        detail(item.url, '+');
        for (const att of (item.attachments || [])) {
            detail(att.url || att.localPath || att.defaultPath, '+');
        }
        detail(item.abstractNote, '-');
        for (const note of (item.notes || [])) {
            detail(note.note, '-');
        }
        detail(year, '#');
        detail(item.publicationTitle, '#');
        for (const name of creators) {
            detail(name, '#');
        }
        for (const tag of (item.tags || [])) {
            detail(tag.tag, '#');
        }
        for (const line of (item.extra || '').split(/\r?\n/).map(l => l.trim())) {
            if (line.match(/^citations:\s*[0-9]+$/)) {
                detail(line, '');
            }
        }
        let itemType = item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1);
        itemType = itemType.replace(/([A-Z]+)/g, ' $1').trim();
        detail(itemType, '#');
        detail(item.uri.split('/').pop(), '');
    }
}
