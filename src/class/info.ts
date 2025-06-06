import { z } from 'zod'

const venueSchema = z.object({
  "capacity":z.number().positive(),
  "shajo_count":z.number().positive(),
}).readonly()

const roundSchema = z.object({
  "name":z.string().nonempty().max(200),
  "short_name":z.string().nonempty().max(200),
  "method":z.string().max(10).regex(/^normal$|^shoot-off$|^distance$/)
}).readonly();

const categorySchema = z.object({
  "name" :z.string().nonempty().max(200),
  "sheet_id":z.string().nonempty().max(200),
  "match_type":z.string().max(11).regex(/^team$|^individual$/),
  "background_color":z.string().startsWith("#").max(10),
  "team_size":z.number().positive(),
  "team_count":z.number().positive(),
  "rounds": z.array(roundSchema).max(200).readonly()
}).readonly()

const categoriesSchema = z.array(categorySchema).max(200).readonly()

const competitionInfoSchema = z.object({
  "venue":venueSchema,
  "categories":categoriesSchema
}).readonly()

type venueInfo = z.infer<typeof venueSchema>;
type categoriesInfo = z.infer<typeof categoriesSchema>;

class Info{
  venue:venueInfo = {} as venueInfo;
  categories:categoriesInfo = [];
  constructor(){}
  setInfo(stringfiedJson:string):boolean{
    try{
      let buf = competitionInfoSchema.parse(JSON.parse(stringfiedJson));
      this.venue = buf.venue;
      this.categories = buf.categories;
      return true;
    }catch(e){
      console.log(e);
      return false;
    }
  }
}

const instance = new Info();
export default instance;
