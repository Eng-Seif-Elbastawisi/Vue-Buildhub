// /**
//  * Country model representing a nation's geographical and cultural data
//  */
// export default class ConfigurationModel {
//   public readonly numberOfBranches: number;
//   public readonly branches: ConfigurationParams[];

//   constructor(data: {
//     numberOfBranches: number;
//     branches: ConfigurationParams[];
//   }) {
//     this.numberOfBranches = data.numberOfBranches;
//     this.branches = data.branches;
//     this.status = data.status;

//     Object.freeze(this);
//   }

//   /**
//    * Create CountryModel from API response
//    * @param json - Raw JSON data from API
//    * @returns CountryModel instance
//    */
//   static fromJson(json: any): EducationConfigurationModel {
//     if (!json) {
//       throw new Error('Cannot create CountryModel from null or undefined');
//     }

//     return new EducationConfigurationModel({
//       id: json.id,
//       title: json.title,
//       created_at: json.created_at,
//       status: json.status,
//     // });
//   }

//   static example: EducationConfigurationModel = new EducationConfigurationModel({
//     id: 1,
//     title: 'Basic education',
//     created_at: '2022-01-01',
//     status: true,
//   });
// }
