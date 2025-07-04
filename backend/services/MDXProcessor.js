const fs = require('fs-extra');
const path = require('path');
const JSON5 = require('json5'); // Importe a biblioteca no topo do seu arquivo


const ProfessorModel = require('../models/Professor');

class MDXProcessor {
    constructor() {
        this.professorModel = new ProfessorModel();
        this.processingStatus = {
            is_processing: false,
            total_files: 0,
            processed_files: 0,
            errors: [],
            current_file: '',
            start_time: null,
            end_time: null
        };
    }

    getProcessingStatus() {
        return this.processingStatus;
    }

    extractDataFromMDX(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');

            // console.log("Content: "+content);

            // Procurar pela exportação const data com regex mais robusta
            //const dataMatch = content.match(/export const data = ({[\s\S]*?^});/m);
            //const dataMatch = content.match(/export const data = (\{[\s\S]*?\});/);
            //const dataMatch = content.match(/export const data = (\{[\s\S]*?\})\s*;?/);

            let searchString = 'export const data =';
            let startIndex = content.indexOf(searchString);

            if (startIndex === -1) {
                let searchStringComp = searchString;
                searchString = 'const data =';
                startIndex = content.indexOf(searchString);

                if (startIndex === -1) {
                    searchStringComp = searchStringComp + " e " + searchString;
                    console.error(`[ERRO] Bloco '${searchStringComp}' não encontrado no arquivo: ${filePath}`);
                    return null;
                }
            }

            // 2. Encontrar o primeiro '{' depois de 'export const data ='
            const objectStartIndex = content.indexOf('{', startIndex);
            if (objectStartIndex === -1) {
                console.error(`[ERRO] Objeto de dados (iniciado com '{') não encontrado após '${searchString}' em: ${filePath}`);
                return null;
            }


            // 3. Contar as chaves para encontrar o final do objeto
            let braceCount = 1;
            let objectEndIndex = -1;

            for (let i = objectStartIndex + 1; i < content.length; i++) {
                const char = content[i];
                if (char === '{') {
                    braceCount++;
                } else if (char === '}') {
                    braceCount--;
                }

                if (braceCount === 0) {
                    // Encontramos o fecha-chaves correspondente!
                    objectEndIndex = i;
                    break;
                }
            }

            if (objectEndIndex === -1) {
                console.error(`[ERRO] Objeto de dados não foi fechado corretamente (chaves '{}' desbalanceadas) em: ${filePath}`);
                return null;
            }

            // 4. Extrair a string do objeto completo
            const dataStr = content.substring(objectStartIndex, objectEndIndex + 1);


            // if (!dataMatch || !dataMatch[1]) {
            //     console.error(`[ERRO] Não encontrou o bloco 'export const data = {...};' no arquivo: ${filePath}`);
            //     return null;
            // }

            // let dataStr = dataMatch[1];

            // let dataStr = content;

            // Usar eval de forma segura para parsear o objeto JavaScript
            try {
                // Criar um contexto seguro para eval
                // const data = eval(`(${dataStr})`);
                //const data = new Function(`return ${dataStr}`)();
                //const data = JSON5.parse(dataStr);
                const data = JSON5.parse(dataStr);


                return data;
                // } catch (evalError) {
            } catch (parseError) {

                console.error(`[ERRO] Falha ao analisar o objeto de dados em ${filePath}. Verifique se há erros de sintaxe (ex: vírgula sobrando).`, parseError.message);
                return null;
            }

        } catch (readError) {
            console.error(`[ERRO] Falha ao ler o arquivo ${filePath}:`, readError.message);
            // } catch (error) {
            //     console.error(`Erro ao processar arquivo ${filePath}:`, error.message);
            return null;
        }
    }

    parseJSObjectManually(jsStr) {
        try {
            // Método mais robusto para parsear objetos JavaScript
            // Remove quebras de linha e espaços extras
            jsStr = jsStr.replace(/\s+/g, ' ').trim();

            // Usar eval de forma segura (apenas para dados conhecidos)
            const data = eval(`(${jsStr})`);
            return data;
        } catch (error) {
            console.error('Erro no parser manual:', error.message);
            return null;
        }
    }

    parseTimeRange(timeStr) {
        if (!timeStr || !timeStr.includes(' - ')) {
            return [null, null];
        }

        const parts = timeStr.split(' - ');
        if (parts.length !== 2) {
            return [null, null];
        }

        return [parts[0].trim(), parts[1].trim()];
    }

    async processProfessorData(data, filePath, versaoAno, versaoSemestre) {
        try {
            const professorNome = data.title || '';
            if (!professorNome) {
                return false;
            }

            // Criar ou buscar professor
            const professor = await this.professorModel.createProfessor(professorNome);
            const professorId = professor._id;

            // Adicionar versão do horário
            await this.professorModel.addVersaoHorario(
                professorId, versaoAno, versaoSemestre, filePath
            );

            // Limpar horários existentes desta versão
            await this.professorModel.clearHorariosByVersao(
                professorId, versaoAno, versaoSemestre
            );

            // Processar horários da semana
            const weekClasses = data.weekClasses || [];
            for (const dayData of weekClasses) {
                const diaSemana = dayData.dayName || '';
                const dayClasses = dayData.dayClasses || [];

                for (const classData of dayClasses) {
                    const disciplina = classData.subject || '';
                    const sala = classData.classroom || '';
                    const turma = (classData.students || []).join(', ');
                    const timeRange = classData.time || '';

                    const [horarioInicio, horarioFim] = this.parseTimeRange(timeRange);

                    if (horarioInicio && horarioFim) {
                        await this.professorModel.createHorario(
                            professorId,
                            versaoAno,
                            versaoSemestre,
                            diaSemana,
                            horarioInicio,
                            horarioFim,
                            disciplina,
                            turma,
                            sala
                        );
                    }
                }
            }

            return true;

        } catch (error) {
            console.error('Erro ao processar dados do professor:', error.message);
            return false;
        }
    }

    async processVersionFolder(versao) {
        try {
            this.processingStatus.start_time = new Date().toISOString();
            this.processingStatus.is_processing = true;
            this.processingStatus.errors = [];


            // O caminho para o diretório do script atual (ex: /home/ubuntu/ifpr-horarios/src)
            const currentDir = __dirname;

            // Usamos path.join para subir um nível ('..') de forma segura
            // Isso resulta em /home/ubuntu/ifpr-horarios
            const basePath = path.join(currentDir, '../..');

            console.log(currentDir);
            console.log(basePath);

            // Caminho para a pasta da versão
            // const basePath = "/home/ubuntu/ifpr-horarios";

            const versionPath = path.join(basePath, "versioned_docs", `version-${versao}`);
            const professorPath = path.join(versionPath, "professor");

            if (!await fs.pathExists(professorPath)) {
                this.processingStatus.errors.push(`Pasta não encontrada: ${professorPath}`);
                this.processingStatus.is_processing = false;
                return false;
            }

            // Listar todos os arquivos MDX
            const files = await fs.readdir(professorPath);
            const mdxFiles = files.filter(f => f.endsWith('.mdx'));
            this.processingStatus.total_files = mdxFiles.length;

            // Extrair ano e semestre da versão
            const versionParts = versao.split('.');
            const versaoAno = versionParts[0] || "2025";
            const versaoSemestre = versionParts[1] || "1";

            // Processar cada arquivo
            for (let i = 0; i < mdxFiles.length; i++) {
                const filename = mdxFiles[i];
                const filePath = path.join(professorPath, filename);

                this.processingStatus.current_file = filename;
                this.processingStatus.processed_files = i;

                // Extrair dados do arquivo
                const data = this.extractDataFromMDX(filePath);
                if (data) {
                    const success = await this.processProfessorData(
                        data, filePath, versaoAno, versaoSemestre
                    );
                    if (!success) {
                        this.processingStatus.errors.push(`Erro ao processar ${filename}`);
                    }
                } else {
                    this.processingStatus.errors.push(`Não foi possível extrair dados de ${filename}`);
                }

                // Pequena pausa para não sobrecarregar
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            this.processingStatus.processed_files = mdxFiles.length;
            this.processingStatus.end_time = new Date().toISOString();
            this.processingStatus.is_processing = false;

            // Dentro de processVersionFolder, antes de construir o versionPath
            console.log(`[DEBUG] Raiz do projeto calculada: ${basePath}`);
            console.log(`[DEBUG] Tentando acessar a pasta de versão: ${versionPath}`);

            return true;

        } catch (error) {
            this.processingStatus.errors.push(`Erro geral: ${error.message}`);
            this.processingStatus.is_processing = false;
            return false;
        }
    }
}

module.exports = MDXProcessor;

