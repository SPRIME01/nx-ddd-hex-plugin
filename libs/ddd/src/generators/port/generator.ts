import {
  Tree,
  formatFiles,
  names,
} from '@nx/devkit';
import { PortGeneratorSchema } from './schema';

/**
 * Generates the TypeScript files for the port and adapter.
 * @param tree The file tree.
 * @param options The generator options.
 */
function addTsFiles(tree: Tree, options: PortGeneratorSchema) {
  const classifiedName = names(options.name).className;
  const propertyName = names(options.name).propertyName;

  const portInterfaceContent = `export interface I${classifiedName} {
  // Add methods here
}
`;

  const inMemoryAdapterContent = `import { I${classifiedName} } from '@${options.domain}/domain';

export class ${classifiedName}InMemoryAdapter implements I${classifiedName} {
  // Implement methods here
}
`;

  tree.write(`libs/${options.domain}/domain/src/lib/ports/${propertyName}.port.ts`, portInterfaceContent);
  tree.write(`libs/${options.domain}/infrastructure/src/lib/adapters/${propertyName}.in-memory.adapter.ts`, inMemoryAdapterContent);
}

/**
 * Generates the Python files for the port and adapter.
 * @param tree The file tree.
 * @param options The generator options.
 */
function addPyFiles(tree: Tree, options: PortGeneratorSchema) {
  const classifiedName = names(options.name).className;
  const snakeCaseName = names(options.name).fileName.replace(/-/g, '_');
  const snakeCaseDomain = options.domain.replace(/-/g, '_');

  const portProtocolContent = `from typing import Protocol

class I${classifiedName}(Protocol):
    # Add methods here
    pass
`;

  const fakeAdapterContent = `from ${snakeCaseDomain}.domain.ports import I${classifiedName}

class ${classifiedName}FakeAdapter(I${classifiedName}):
    # Implement methods here
    pass
`;

  tree.write(`libs/${options.domain}/domain/src/lib/ports/${snakeCaseName}_port.py`, portProtocolContent);
  tree.write(`libs/${options.domain}/infrastructure/src/lib/adapters/${snakeCaseName}_fake_adapter.py`, fakeAdapterContent);
}

export async function portGenerator(
  tree: Tree,
  options: PortGeneratorSchema
) {
  if (options.language === 'ts') {
    addTsFiles(tree, options);
  } else if (options.language === 'py') {
    addPyFiles(tree, options);
  }

  await formatFiles(tree);
}

export default portGenerator;
