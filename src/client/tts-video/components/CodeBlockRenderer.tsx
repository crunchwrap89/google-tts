import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Highlight, themes } from "prism-react-renderer";

interface CodeBlock {
    language: string;
    content: string;
    startTime: number;
    duration: number;
}

export const CodeBlockRenderer: React.FC<{ codeBlocks?: CodeBlock[] }> = ({ codeBlocks }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    if (!codeBlocks) return null;

    const currentTime = frame / fps;
    const activeBlock = codeBlocks.find(block =>
        currentTime >= block.startTime && currentTime < block.startTime + block.duration
    );

    if (!activeBlock) return null;

    return (
        <AbsoluteFill style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 100
        }}>
            <div style={{
                borderRadius: '10px',
                overflow: 'hidden',
                maxWidth: '90%',
                maxHeight: '90%',
                fontSize: '24px',
                fontFamily: 'monospace',
                textAlign: 'left',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
                <div style={{
                    backgroundColor: '#1e1e1e',
                    padding: '10px 20px',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#27c93f' }} />
                    <span style={{ marginLeft: '10px', color: '#888', fontSize: '14px' }}>{activeBlock.language}</span>
                </div>
                <Highlight
                    theme={themes.vsDark}
                    code={activeBlock.content}
                    language={activeBlock.language}
                >
                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                        <pre style={{ ...style, padding: '20px', margin: 0, overflow: 'auto' }}>
                            {tokens.map((line, i) => (
                                <div key={i} {...getLineProps({ line })}>
                                    <span style={{ display: 'inline-block', width: '2em', color: '#666', userSelect: 'none' }}>{i + 1}</span>
                                    {line.map((token, key) => (
                                        <span key={key} {...getTokenProps({ token })} />
                                    ))}
                                </div>
                            ))}
                        </pre>
                    )}
                </Highlight>
            </div>
        </AbsoluteFill>
    );
};

