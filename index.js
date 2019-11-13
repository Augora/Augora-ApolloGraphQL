const { ApolloServer, gql } = require("apollo-server");
const AugoraAPI = require("./AugoraAPI");

const typeDefs = gql`
  enum GroupeSigle {
    GDR
    LFI
    LR
    LREM
    LT
    MODEM
    NI
    NG
    SOC
    UAI
  }

  enum Sexe {
    F
    H
  }

  type AncienMandat {
    date_debut: String
    date_fin: String
    intitule: String
  }

  type AutreMandat {
    localite: String
    institution: String
    intitule: String
  }

  type Activite {
    date_debut: String
    date_fin: String
    numero_de_semaine: Int
    presences_commission: Int
    presences_hemicycle: Int
    participations_commission: Int
    participations_hemicycle: Int
    questions: Int
    vacances: Int
  }

  type Deputy {
    id: Int
    nom: String
    nom_de_famille: String
    prenom: String
    sexe: Sexe
    date_naissance: String
    lieu_naissance: String
    num_deptmt: String
    nom_circo: String
    num_circo: Int
    mandat_debut: String
    groupe_sigle: GroupeSigle
    parti_ratt_financier: String
    profession: String
    place_en_hemicycle: String
    url_an: String
    id_an: String
    slug: String
    url_nosdeputes: String
    url_nosdeputes_api: String
    nb_mandats: Int
    twitter: String
    sites_web: [String]
    emails: [String]
    adresses: [String]
    collaborateurs: [String]
    anciens_mandats: [String] @deprecated(reason: "Use AnciensMandats.")
    autres_mandats: [String] @deprecated(reason: "Use AutresMandats.")
    AnciensMandats: [AncienMandat]
    AutresMandats: [AutreMandat]
  }

  type Query {
    Deputes: [Deputy]
    DeputesEnMandat: [Deputy]
    Depute(slug: String): Deputy
    Activite(slug: String, count: Int = 3): [Activite]
  }
`;

const resolvers = {
  Query: {
    Deputes: async (_source, _args, { dataSources: { AugoraAPI } }) => {
      var deputes = await AugoraAPI.getDeputes();
      return deputes.sort((a, b) => {
        if (a.nom === "Cédric Roussel") return -1;
        if (b.nom === "Cédric Roussel") return 1;
        return (a.nom_de_famille + a.prenom).localeCompare(
          b.nom_de_famille + b.prenom
        );
      });
    },
    DeputesEnMandat: async (_source, _args, { dataSources: { AugoraAPI } }) => {
      var deputes = await AugoraAPI.getDeputesEnMandat();
      return deputes.sort((a, b) => {
        if (a.nom === "Cédric Roussel") return -1;
        if (b.nom === "Cédric Roussel") return 1;
        return (a.nom_de_famille + a.prenom).localeCompare(
          b.nom_de_famille + b.prenom
        );
      });
    },
    Depute: async (_source, _args, { dataSources: { AugoraAPI } }) => {
      return AugoraAPI.getDepute(_args.slug);
    },
    Activite: async (_source, _args, { dataSources: { AugoraAPI } }) => {
      console.log(_args);
      var activites = await AugoraAPI.getDeputeActitvites(_args.slug);
      return activites
        .filter((a, _, array) => {
          return a.numero_de_semaine > array.length - _args.count;
        })
        .sort((a, b) => a.numero_de_semaine - b.numero_de_semaine);
    }
  },
  Deputy: {
    adresses: async _source => {
      return _source.adresses.map(a => a.adresse);
    },
    sites_web: async _source => {
      return _source.sites_web.map(s => s.site);
    },
    emails: async _source => {
      return _source.emails.map(e => e.email);
    },
    collaborateurs: async _source => {
      return _source.collaborateurs.map(c => c.collaborateur);
    },
    anciens_mandats: async _source => {
      return _source.anciens_mandats.map(am => am.mandat);
    },
    autres_mandats: async _source => {
      return _source.autres_mandats.map(am => am.mandat);
    },
    AnciensMandats: async _source => {
      return _source.anciens_mandats;
    },
    AutresMandats: async _source => {
      return _source.autres_mandats;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => {
    return {
      AugoraAPI: new AugoraAPI()
    };
  },
  onHealthCheck: () => {
    return new Promise((resolve, reject) => {
      // Replace the `true` in this conditional with more specific checks!
      if (true) {
        resolve();
      } else {
        reject();
      }
    });
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
  console.log(
    `Try your health check at: ${url}.well-known/apollo/server-health`
  );
});
