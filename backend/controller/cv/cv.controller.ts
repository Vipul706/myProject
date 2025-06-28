import type { Request, Response } from 'express'
const dataObject = {
    exp: [{
        name: 'Borcelle Studio',
        duration: '2030 - Present',
        position: 'Marketing Manager & Specialist',
        pointers: [
            "Led the development and implementation of comprehensive marketing strategies that resulted in a 20% increase in brand visibility and a 15% growth in sales within the first year.",
            "Successfully launched and managed multiple cross-channel campaigns, including digital marketing, social media, and traditional advertising, resulting in improved customer acquisition and retention rates."
        ]
    },
    {
        name: 'Borcelle Studio',
        duration: '2030 - Present',
        position: 'Marketing Manager & Specialist',
        pointers: [
            "Led the development and implementation of comprehensive marketing strategies that resulted in a 20% increase in brand visibility and a 15% growth in sales within the first year.",
            "Successfully launched and managed multiple cross-channel campaigns, including digital marketing, social media, and traditional advertising, resulting in improved customer acquisition and retention rates."
        ]
    },
    {
        name: 'Borcelle Studio',
        duration: '2030 - Present',
        position: 'Marketing Manager & Specialist',
        pointers: [
            "Led the development and implementation of comprehensive marketing strategies that resulted in a 20% increase in brand visibility and a 15% growth in sales within the first year.",
            "Successfully launched and managed multiple cross-channel campaigns, including digital marketing, social media, and traditional advertising, resulting in improved customer acquisition and retention rates."
        ]
    },
    ],
    skills:[],
    education:[]
}
const getCvTemp = (req: Request, res: Response) => {
    res.render('cv.ejs', { data: dataObject });
}

export { getCvTemp }