import {
  Tree,
  formatFiles,
  getWorkspaceLayout,
  names,
  addProjectConfiguration,
  readProjectConfiguration,
} from '@nx/devkit';
import * as path from 'path';
import { HexDomainGeneratorSchema } from './schema';

interface NormalizedSchema extends HexDomainGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  tree: Tree,
  options: HexDomainGeneratorSchema,
  layer: 'domain' | 'application' | 'infrastructure'
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = `${name}/${layer}`;
  const projectName = `${name}-${layer}`;
  const projectRoot = `libs/${projectDirectory}`;
  const parsedTags = [`type:${layer}`, `domain:${name}`];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema, layer: 'domain' | 'application' | 'infrastructure') {
  const marker = layer.toUpperCase();
  const template = `// ${marker}_EXPORTS`;
  tree.write(`${options.projectRoot}/src/index.ts`, template);
}

export async function hexDomainGenerator(
  tree: Tree,
  options: HexDomainGeneratorSchema
) {
  const layers: ('domain' | 'application' | 'infrastructure')[] = [
    'domain',
    'application',
    'infrastructure',
  ];

  for (const layer of layers) {
    const normalizedOptions = normalizeOptions(tree, options, layer);
    try {
      readProjectConfiguration(tree, normalizedOptions.projectName);
    } catch (e) {
      addProjectConfiguration(tree, normalizedOptions.projectName, {
        root: normalizedOptions.projectRoot,
        projectType: 'library',
        sourceRoot: `${normalizedOptions.projectRoot}/src`,
        targets: {},
        tags: normalizedOptions.parsedTags,
      });
      addFiles(tree, normalizedOptions, layer);
    }
  }

  await formatFiles(tree);
}

export default hexDomainGenerator;
