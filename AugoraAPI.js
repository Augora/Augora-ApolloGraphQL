const { RESTDataSource } = require("apollo-datasource-rest");

class AugoraAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://api.augora.fr/";
  }

  async getDeputes() {
    return this.get(`deputes`);
  }

  async getDeputesEnMandat() {
    return this.get(`deputesenmandat`);
  }

  async getDepute(slug) {
    return this.get(`deputes/${slug}`);
  }

  async getDeputeActitvites(slug) {
    return this.get(`deputes/${slug}/activites`);
  }
}

module.exports = AugoraAPI;
