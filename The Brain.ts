declare const Zotero: any

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
})

function clean(txt) {
  return txt.replace(/\r/g, '').replace(/\n/g, ' ').replace(/;/g, ',').replace(/["“”]/g, "'")
}

function url(txt) {
  const arbitrary_tb_limit = 185
  const ellipses = ' ...'

  if (txt[0] === '/' || txt.match(/^[a-z]:\\/i)) {
    txt = txt.replace(/\\/g, '/')

    // Windows drive letter must be prefixed with a slash
    if (txt[0] !== '/') txt = `/${txt}`

    // Escape required characters for path components
    // See: https://tools.ietf.org/html/rfc3986#section-3.3
    txt = encodeURI(`file://${txt}`).replace(/[?#]/g, encodeURIComponent)
  }

  if (txt.length <= arbitrary_tb_limit) return txt
  return txt.substr(0, arbitrary_tb_limit - ellipses.length) + ellipses
}

const ignore = new Set(['attachment', 'note'])

function detail(txt, prefix) {
  if (!txt) return

  txt = prefix === '+' ? url(txt) : clean(txt)
  if (prefix) prefix += ' '

  Zotero.write(`\t${prefix}${txt}\n`)
}

function doExport() {
  let item
  while (item = Zotero.nextItem()) {
    if (ignore.has(item.itemType)) continue

    for (const [alias, field] of aliases) {
      if (item[alias]) {
        item[field] = item[alias]
        delete item[alias]
      }
    }

    const reference = []
    const creators = (item.creators || []).map(creator => {
      let name = ''
      if (creator.name) name = creator.name
      if (creator.lastName) name = creator.lastName
      if (creator.firstName) name += (name ? ', ' : '') + creator.firstName
      return name
    })
    switch (creators.length) {
      case 0:
        break
      case 1:
        reference.push(creators[0])
        break
      default:
        reference.push(`${creators[0]} et al`)
        break
    }

    const date = Zotero.Utilities.strToDate(item.date)
    const year = (date && typeof date.year !== 'undefined') ? date.year : ''
    if (year) reference.push(year)

    let title = item.title
    if (reference.length) title += `, (${reference.join(', ')})`
    Zotero.write(clean(title) + '\n')

    const [ , ug, libraryID, key ] = item.uri.match(/http:\/\/zotero\.org\/(users|groups)\/([^\/]+)\/items\/(.+)/)
    detail(`zotero://select/items/${ug === 'users' && libraryID === 'local' ? '0' : libraryID}_${key}`, '+')

    detail(item.url, '+')
    for (const att of (item.attachments || [])) {
      detail(att.localPath || att.defaultPath || att.url, '+')
    }

    detail(item.abstractNote, '-')
    for (const note of (item.notes || [])) {
      detail(note.note.replace(/<[^>]*>?/g, ''), '-')
    }

    for (const name of creators) {
      detail(name, '#')
    }

    detail(year, '#')
    detail(item.publicationTitle, '#')

    for (const tag of (item.tags || [])) {
      if (tag.type === 1) continue // automatic tag
      detail(tag.tag, '#')
    }

    let itemType = item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1)
    itemType = itemType.replace(/([A-Z]+)/g, ' $1').trim()
    detail(itemType, '#')

    for (const line of (item.extra || '').split(/\r?\n/).map(l => l.trim())) {
      if (line.match(/^[0-9]{5}$/)) {
        detail(`Citations: ${line.replace(/^0+/, '') || 0}`, '')
      }
    }

    detail(item.uri.split('/').pop(), '')

    Zotero.write('\n')
  }
}

/*
{
   "relations" : {},
   "attachments" : [
      {
         "contentType" : "application/pdf",
         "itemType" : "attachment",
         "parentItem" : "VUL8ZVJ8",
         "uri" : "http://zotero.org/users/local/6z7M0kXV/items/UTUXSHXA",
         "filename" : "Araz et al. - 2014 - Using Google Flu Trends data in forecasting influe.pdf",
         "tags" : [],
         "version" : 0,
         "charset" : "",
         "localPath" : "/home/emile/.BBTZ5TEST/zotero/storage/UTUXSHXA/Araz et al. - 2014 - Using Google Flu Trends data in forecasting influe.pdf",
         "dateModified" : "2019-01-16T14:48:43Z",
         "linkMode" : "imported_file",
         "relations" : {},
         "title" : "Araz et al. - 2014 - Using Google Flu Trends data in forecasting influe.pdf",
         "dateAdded" : "2019-01-16T14:48:43Z"
      }
   ],
   "url" : "http://www.ajemjournal.com/article/S0735-6757(14)00421-5/abstract",
   "dateAdded" : "2019-01-16T11:47:49Z",
   "accessDate" : "2016-10-07T22:48:15Z",
   "publicationTitle" : "The American Journal of Emergency Medicine",
   "notes" : [
      {
         "dateModified" : "2019-01-16T14:40:52Z",
         "relations" : {},
         "dateAdded" : "2019-01-16T14:40:43Z",
         "itemType" : "note",
         "note" : "<p>stuf with <strong>bold</strong></p>",
         "parentItem" : "VUL8ZVJ8",
         "tags" : [],
         "key" : "DUSDL5F2",
         "version" : 0
      }
   ],
   "version" : 0,
   "ISSN" : "0735-6757, 1532-8171",
   "collections" : [],
   "extra" : "PMID: 25037278",
   "title" : "Using Google Flu Trends data in forecasting influenza-like-illness related ED visits in Omaha, Nebraska",
   "language" : "English",
   "pages" : "1016–1023",
   "dateModified" : "2019-01-16T14:03:46Z",
   "abstractNote" : "Introduction\nEmergency department (ED) visits ... and overcrowding.",
   "date" : "2014-09-01",
   "DOI" : "10.1016/j.ajem.2014.05.052",
   "journalAbbreviation" : "The American Journal of Emergency Medicine",
   "tags" : [
      {
         "tag" : "qwef"
      }
   ],
   "uri" : "http://zotero.org/users/local/6z7M0kXV/items/VUL8ZVJ8",
   "issue" : "9",
   "creators" : [
      {
         "lastName" : "Araz",
         "creatorType" : "author",
         "firstName" : "Ozgur M."
      },
      {
         "creatorType" : "author",
         "firstName" : "Dan",
         "lastName" : "Bentley"
      },
      {
         "creatorType" : "author",
         "firstName" : "Robert L.",
         "lastName" : "Muelleman"
      }
   ],
   "itemType" : "journalArticle",
   "volume" : "32",
   "libraryCatalog" : "www.ajemjournal.com"
}
*/
