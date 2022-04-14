import PdfPrinter from "pdfmake";

export const getPdfReadableStream = (movie) => {
    const fonts = {
        Helvetica: {
            normal: "Helvetica",
            bold: "Helvetica-Bold"
        }
    }

    const printer = new PdfPrinter(fonts)

    const docDefinition = {
        content: [
            
            {
                text: `Movie title: ${movie.Title} \n\n`,
                style: "header"
            },
            {
                text: `Movie year: ${movie.Year} \n\n`,
                style: "subheader",
            },
            {
                text: `Movie id: ${movie._id} \n\n`,
                style: "subheader",
            },
            {
                text: `Movie Poster Url: ${movie.Poster} \n\n`,
                style: "subheader",
            }
        ],
        styles: {
            header: {
              fontSize: 18,
              bold: true,
            },
            subheader: {
              fontSize: 15,
              bold: true,
            },
            small: {
              fontSize: 8,
            },
          },
          defaultStyle: {
            font: "Helvetica",
          },
    }

    const pdfReadableStream = printer.createPdfKitDocument(docDefinition, {})
    pdfReadableStream.end()
    return pdfReadableStream

}