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
  return txt.replace(/\r/g, '').replace(/\n/g, ' ').replace(/;/g, ',').replace(/"/g, "'")
}

const ignore = new Set(['attachment', 'note'])

function detail(txt, prefix) {
  if (!txt) return

  if (prefix !== '+') txt = clean(txt)
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

    detail(item.url, '+')
    for (const att of (item.attachments || [])) {
      detail(att.url || att.localPath || att.defaultPath, '+')
    }

    detail(item.abstractNote, '-')
    for (const note of (item.notes || [])) {
      detail(note.note, '-')
    }

    detail(year, '#')
    detail(item.publicationTitle, '#')

    for (const name of creators) {
      detail(name, '#')
    }

    for (const tag of (item.tags || [])) {
      detail(tag.tag, '#')
    }

    for (const line of (item.extra || '').split(/\r?\n/).map(l => l.trim())) {
      if (line.match(/^citations:\s*[0-9]+$/)) {
        detail(line, '')
      }
    }

    let itemType = item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1)
    itemType = itemType.replace(/([A-Z]+)/g, ' $1').trim()
    detail(itemType, '#')

    detail(item.uri.split('/').pop(), '')
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
   "abstractNote" : "Introduction\nEmergency department (ED) visits increase during the influenza seasons. It is essential to identify statistically significant correlates in order to develop an accurate forecasting model for ED visits. Forecasting influenza-like-illness (ILI)-related ED visits can significantly help in developing robust resource management strategies at the EDs.\nMethods\nWe first performed correlation analyses to understand temporal correlations between several predictors of ILI-related ED visits. We used the data available for Douglas County, the biggest county in Nebraska, for Omaha, the biggest city in the state, and for a major hospital in Omaha. The data set included total and positive influenza test results from the hospital (ie, Antigen rapid (Ag) and Respiratory Syncytial Virus Infection (RSV) tests); an Internet-based influenza surveillance system data, that is, Google Flu Trends, for both Nebraska and Omaha; total ED visits in Douglas County attributable to ILI; and ILI surveillance network data for Douglas County and Nebraska as the predictors and data for the hospital's ILI-related ED visits as the dependent variable. We used Seasonal Autoregressive Integrated Moving Average and Holt Winters methods with3 linear regression models to forecast ILI-related ED visits at the hospital and evaluated model performances by comparing the root means square errors (RMSEs).\nResults\nBecause of strong positive correlations with ILI-related ED visits between 2008 and 2012, we validated the use of Google Flu Trends data as a predictor in an ED influenza surveillance tool. Of the 5 forecasting models we have tested, linear regression models performed significantly better when Google Flu Trends data were included as a predictor. Regression models including Google Flu Trends data as a predictor variable have lower RMSE, and the lowest is achieved when all other variables are also included in the model in our forecasting experiments for the first 5 weeks of 2013 (with RMSE = 57.61).\nConclusions\nGoogle Flu Trends data statistically improve the performance of predicting ILI-related ED visits in Douglas County, and this result can be generalized to other communities. Timely and accurate estimates of ED volume during the influenza season, as well as during pandemic outbreaks, can help hospitals plan their ED resources accordingly and lower their costs by optimizing supplies and staffing and can improve service quality by decreasing ED wait times and overcrowding.",
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
