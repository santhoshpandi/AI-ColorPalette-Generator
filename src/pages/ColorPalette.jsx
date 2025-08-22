import axios from 'axios'
import { useState } from 'react'

const ColorPalette = () => {

  const [query, setQuery] = useState('')
  const [colors, setColors] = useState([])
  const [loading, setLoading] = useState(false)

  //For copying in clipboard changes..
  const [copied, setCopied] = useState('')

  async function handleClick() {
    try {
      setLoading(true)
      setColors([])

      const prompt = `Give me 5 hex color for : ${query}. 
                      The output should only contains the array of 5 hex color.
                      If the query/scenario is empty/missing.. assume as mystery`

      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions',
        {
          // model: 'openai/gpt-3.5-turbo',
          model: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
          // model: 'deepseek/deepseek-r1-0528:free',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            "Content-Type": 'application/json'
          }
        }
      )

      const str = response.data.choices[0].message.content
      // str =  "Here are colors: #fff, #a1b2c3, and some text #1234567.";

      const regex = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;

      const matched = str.match(regex)
      // console.log(str)

      if (matched.length === 5) setColors(matched)
    }
    catch (err) {
      console.log(err.message)
      // Incase of error.. we've set some random colors..
      setColors(['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'])
      alert('Error occured.. Loading default colors..')
    }
    finally {
      setLoading(false)
    }
  }

  async function copyToClipBoard(color) {
    try {
      await navigator.clipboard.writeText(color);
      setCopied(color)

      setTimeout(() => {
        setCopied('')
      },4000)
    }
    catch (err) {
      console.log(err.message)
    }
  }

  return (
    <div className='p-12'>
      <div className='flex flex-col w-full md:w-1/2 mx-auto gap-5 mb-12'>
        <h2 className='p-2 text-2xl text-lime-100 font-bold text-center'>
          🎨 AI Color Palette Wizard
        </h2>
        <input
          onChange={(e) => setQuery(e.target.value)}
          value={query}
          placeholder='Enter you scenario... (eg. Beach, Sitting in Hell..)'
          className='bg-slate-700 text-white'
          type="text" />
        <button
          onClick={handleClick}
          disabled={loading}
          className=' bg-lime-500 mx-auto hover:bg-lime-600 text-lg'
        >
          {loading ? 'Generating...' : 'Generate Palette'}
        </button>
      </div>

      {/* Result */}
      {
        colors.length > 0 &&
        <div className=' grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 max-w-3xl mx-auto'>
        {
          colors.map((color, index) => (
            <section key={index}>
              <div
                onClick={()=>copyToClipBoard(color)}
                style={{backgroundColor: color}}
                className='aspect-square w-[100px] mx-auto rounded-md cursor-pointer flex items-center justify-center'>
                <h5 className='font-semibold text-gray-500'>{copied === color ? 'Saved..' :''}</h5>
              </div>
              <h4 className='text-center mt-3 text-lime-100'>{color}</h4>
            </section>
          ))
        }
      </div>
      }

    </div>
  )
}

export default ColorPalette