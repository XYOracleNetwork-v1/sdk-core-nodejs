import { Wizard } from "../base"
import { IArchivistRepositoryConfig } from "@xyo-network/archivist-repository"
import { SqlRepositoryWizard } from "./sql"
import { LevelRepositoryWizard } from "./level"
import { Neo4jRepositoryWizard } from "./neo4j"

export enum XyoRepository {
  MYSQL = 'mysql',
  LEVEL = 'level',
  NEO4J = 'neo4j',
}

export class RepositoryWizard extends Wizard {

  public async start(): Promise<IArchivistRepositoryConfig | undefined> {
    const { repository } = await this.prompt<{ repository: string }>({
      initial: true,
      type: 'select',
      choices: [
        XyoRepository.MYSQL,
        XyoRepository.LEVEL,
        XyoRepository.NEO4J,
      ],
      message: `What type of repository?`,
      name: 'repository',
    })

    if (repository.includes(XyoRepository.MYSQL)) {
      return new SqlRepositoryWizard().start()
    }

    if (repository.includes(XyoRepository.LEVEL)) {
      return new LevelRepositoryWizard().start()
    }

    if (repository.includes(XyoRepository.NEO4J)) {
      return new Neo4jRepositoryWizard().start()
    }

    return
  }
}
